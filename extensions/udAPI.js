class MyExtension {
    getInfo() {
        return {
            id: 'udAPI',
            name: '畅议API',
            docsURI: "https://extensions.udbbs.top/udAPI.html",
            color1: '#0e2b3d', // 1c
            color2: '#153f5a', // 2c
            color3: '#153f5a', // 3c

            blocks: [
                {
                    opcode: 'API',
                    blockType: Scratch.BlockType.REPORTER,
                    text: '发送API请求: [API] 值: [VAL]',
                    arguments: {
                        API: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: 'login-api-yn.php'
                        },
                        VAL: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: 'key=uDD000010&username=test&password=123456'
                        }
                    }
                },
                {
                    opcode: 'loginAPI',
                    blockType: Scratch.BlockType.REPORTER,
                    text: '发送登录请求 账户: [PARAM1] 密码: [PARAM2]',
                    arguments: {
                        PARAM1: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: 'test'
                        },
                        PARAM2: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: '123456'
                        }
                    }
                },
                {
                    opcode: 'uploadAPI',
                    blockType: Scratch.BlockType.REPORTER,
                    text: '发送上传请求 账户: [PARAM1] 密码: [PARAM2] 键: [KEY] 值: [VAL]',
                    arguments: {
                        PARAM1: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: 'test'
                        },
                        PARAM2: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: '123456'
                        }
                    }
                }
            ]
        };
    }

    API(args) {
        const url = 'http://huangr.yue-neng.com/api/' + args.API + '?' + args.VAL;

        return fetch(url)
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    console.log('请求成功');
                } else {
                    console.log('请求失败: ' + data.message);
                }
                return JSON.stringify(data);
            })
            .catch(error => {
                console.log('请求失败: ' + error.message);
                return JSON.stringify(data);
            });
    }
    loginAPI(args) {
        const url = 'http://huangr.yue-neng.com/api/login-api-yn.php?key=uDD000010&username=' + args.PARAM1 + '&password=' + args.PARAM2;

        return fetch(url)
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    console.log('请求成功');
                } else {
                    console.log('请求失败: ' + data.message);
                }
                return JSON.stringify(data);
            })
            .catch(error => {
                console.log('请求失败: ' + error.message);
                return JSON.stringify(data);
            });
    }
    uploadAPI(args) {
        const url = 'http://huangr.yue-neng.com/api/upload-data-api-yn.php?key=uDD000010&username=' + args.PARAM1 + '&password=' + args.PARAM2 + '&json_key=' + args.KEY + '&json_val=' + args.VAL;

        return fetch(url)
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    console.log('请求成功');
                } else {
                    console.log('请求失败: ' + data.message);
                }
                return JSON.stringify(data);
            })
            .catch(error => {
                console.log('请求失败: ' + error.message);
                return JSON.stringify(data);
            });
    }
}

Scratch.extensions.register(new MyExtension());
