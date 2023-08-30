// Modified with Sound extension

((Scratch) => {
    "use strict";

    const audioEngine = Scratch.vm.runtime.audioEngine;

    const fetchAsArrayBufferWithTimeout = (url) =>
        new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        let timeout = setTimeout(() => {
            xhr.abort();
            reject(new Error("Timed out"));
        }, 5000);
        xhr.onload = () => {
            clearTimeout(timeout);
            if (xhr.status === 200) {
            resolve(xhr.response);
            } else {
            reject(new Error(`HTTP error ${xhr.status} while fetching ${url}`));
            }
        };
        xhr.onerror = () => {
            clearTimeout(timeout);
            reject(new Error(`Failed to request ${url}`));
        };
        xhr.responseType = "arraybuffer";
        xhr.open("GET", url);
        xhr.send();
        });

    const decodeSoundPlayer = async (url) => {
        const cached = soundPlayerCache.get(url);
        if (cached) {
        if (cached.sound) {
            return cached.sound;
        }
        throw cached.error;
        }

        try {
        const arrayBuffer = await fetchAsArrayBufferWithTimeout(url);
        const soundPlayer = await audioEngine.decodeSoundPlayer({
            data: {
            buffer: arrayBuffer,
            },
        });
        soundPlayerCache.set(url, {
            sound: soundPlayer,
            error: null,
        });
        return soundPlayer;
        } catch (e) {
        soundPlayerCache.set(url, {
            sound: null,
            error: e,
        });
        throw e;
        }
    };

    /**
     * @param {string} url
     * @param {VM.Target} target
     * @returns {Promise<boolean>} true if the sound could be played, false if the sound could not be decoded
     */
    const playWithAudioEngine = async (url, target) => {
        const soundBank = target.sprite.soundBank;

        /** @type {AudioEngine.SoundPlayer} */
        let soundPlayer;
        try {
        const originalSoundPlayer = await decodeSoundPlayer(url);
        soundPlayer = originalSoundPlayer.take();
        } catch (e) {
        console.warn(
            "Could not fetch audio; falling back to primitive approach",
            e
        );
        return false;
        }

        soundBank.addSoundPlayer(soundPlayer);
        await soundBank.playSound(target, soundPlayer.id);

        delete soundBank.soundPlayers[soundPlayer.id];
        soundBank.playerTargets.delete(soundPlayer.id);
        soundBank.soundEffects.delete(soundPlayer.id);

        return true;
    };

    const playWithAudioElement = (url, target) =>
        new Promise((resolve, reject) => {
        const mediaElement = new Audio(url);

        mediaElement.volume = target.volume / 100;

        mediaElement.onended = () => {
            resolve();
        };
        mediaElement
            .play()
            .then(() => {
            })
            .catch((err) => {
            reject(err);
            });
        });

    const playSound = async (url, target) => {
        try {
        if (!(await Scratch.canFetch(url))) {
            throw new Error(`Permission to fetch ${url} denied`);
        }

        const success = await playWithAudioEngine(url, target);
        if (!success) {
            return await playWithAudioElement(url, target);
        }
        } catch (e) {
        console.warn(`All attempts to play ${url} failed`, e);
        }
    };

    class Sound {
        getInfo() {
        return {
            id: "lazyAudio",
            name: "LazyAudio",
            blocks: [
                {
                    opcode: "play",
                    blockType: Scratch.BlockType.COMMAND,
                    text: "Play( [path] )",
                    arguments: {
                        path: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: "6ac484e97c1c1fe1384642e26a125e70.wav",
                        },
                    },
                },
                {
                    opcode: "playUntilDone",
                    blockType: Scratch.BlockType.COMMAND,
                    text: "PlayAndWait( [path] )",
                    arguments: {
                        path: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: "6ac484e97c1c1fe1384642e26a125e70.wav",
                        },
                    },
                },
            ],
        };
        }

        play({ path }, util) {
            path = 'https://cdn.gitblock.cn/Media?name=' + path;
            playSound(path, util.target);
        }

        playUntilDone({ path }, util) {
            path = 'https://cdn.gitblock.cn/Media?name=' + path;
            return playSound(path, util.target);
        }
    }

    Scratch.extensions.register(new Sound());
})(Scratch);