class udAPIExtension {
    constructor() {
        this.ext_report = '';

        this.authorName = '';
        this.authorPwd = '';

        this.projectName = '';
        this.project = '_';

        this.logedUser = [];
        this.logedUserPwd = [];
    }

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
                    opcode: 'report',
                    blockType: Scratch.BlockType.REPORTER,
                    text: '应答',
                },
                {
                    opcode: 'defAuthor',
                    blockType: Scratch.BlockType.COMMAND,
                    text: '这是 作者: [AUTHOR] 密码: [PWD] 的作品',
                    arguments: {
                        AUTHOR: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: 'test'
                        },
                        PWD: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: '123456'
                        }
                    }
                },
                {
                    opcode: 'defProject',
                    blockType: Scratch.BlockType.COMMAND,
                    text: '这是 作品: [PROJECT]',
                    arguments: {
                        PROJECT: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: '114514'
                        }
                    }
                },
                '---',
                {
                    opcode: 'API',
                    blockType: Scratch.BlockType.REPORTER,
                    text: 'GET: [API] 值: [VAL]',
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
                '---',
                {
                    opcode: 'loginAPI',
                    blockType: Scratch.BlockType.REPORTER,
                    text: '登录 账户: [PARAM1] Token: [PARAM2]',
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
                    text: '以 账户: [PARAM1] 的身份上传 值: [VAL]',
                    arguments: {
                        PARAM1: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: 'test'
                        },
                        VAL: {
                            type: Scratch.ArgumentType.STRING
                        }
                    }
                },
                {
                    opcode: 'readAPI',
                    blockType: Scratch.BlockType.REPORTER,
                    text: '以 账户: [PARAM1] 的身份读取 值',
                    arguments: {
                        PARAM1: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: 'test'
                        }
                    }
                }
            ]
        };
    }

    report() {
        return this.ext_report;
    }

    defAuthor(args) {
        const url = 'http://huangr.yue-neng.com/api/defAuthor-api-yn.php?key=uDD000010&username=' + args.AUTHOR + '&password=' + args.PWD;

        return fetch(url)
            .then(response => response.json())
            .then(data => {
                if (data.status === 'success') {
                    console.log('请求成功');
                    this.ext_report = '作者定义成功！';
                    this.authorName = args.AUTHOR;
                    this.authorPwd = args.PWD;
                } else {
                    console.log('请求失败: ' + data.message);
                    this.ext_report = '无法定义作者: ' + data.message;
                }
            })
            .catch(error => {
                console.log('请求失败: ' + error.message);
                this.ext_report = '无法定义作者: 无网络或在编辑器中';
            });
    }

    defProject(args) {
        if (this.authorName) {
            this.projectName = args.PROJECT;
            this.project = this.authorName + '_' + this.projectName;
            this.ext_report = '定义作品成功！';
        } else {
            this.ext_report = '你没有定义作者！';
        }
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
                    if (!this.logedUser.includes(args.PARAM1)) {
                        this.logedUser.push(args.PARAM1);
                        this.logedUserPwd.push(args.PARAM2);
                    }
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
        if (this.authorName) {
            if (this.logedUser.includes(args.PARAM1)) {
                var index = this.logedUser.indexOf(args.PARAM1);
                if (index === -1) {
                    return '无此用户';
                } else {
                    var user = this.logedUser[index];
                    var pwd = this.logedUserPwd[index];
                    const url = 'http://huangr.yue-neng.com/api/upload-data-api-yn.php?key=uDD000010&username=' + user + '&password=' + pwd + '&json_key=' + this.project + '&json_val=' + args.VAL;

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
            } else {
                return '无此用户';
            }
        } else {
            return '你没有定义作者！';
        }
    }

    readAPI(args) {
        if (this.authorName) {
            if (this.logedUser.includes(args.PARAM1)) {
                var index = this.logedUser.indexOf(args.PARAM1);
                if (index === -1) {
                    return '无此用户';
                } else {
                    var user = this.logedUser[index];
                    var pwd = this.logedUserPwd[index];

                    const url = 'http://huangr.yue-neng.com/api/read-data-api-yn.php?key=uDD000010&username=' + user + '&password=' + pwd + '&json_key=' + this.project;

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
            } else {
                return '无此用户';
            }
        } else {
            return '你没有定义作者！';
        }
    }
}

Scratch.extensions.register(new udAPIExtension());
