(function() {
    'use strict';
    class miniTools {
        getInfo() {
            return {
                id: 'miniTools',
                name: '小工具',
                color1: '#0093e6', // 1c
                color2: '#0da8ff', // 2c
                color3: '#0da8ff', // 3c
                blocks: [
                {
                    opcode: 'strictlyEquals',
                    blockType: Scratch.BlockType.BOOLEAN,
                    text: '[ONE] === [TWO]',
                    arguments: {
                        ONE: {
                        type: Scratch.ArgumentType.STRING,
                        defaultValue: 'a'
                        },
                        TWO: {
                        type: Scratch.ArgumentType.STRING,
                        defaultValue: 'A'
                        }
                    }
                    },
                    {
                        opcode: 'greaterThanOrEqual',
                        blockType: Scratch.BlockType.BOOLEAN,
                        text: '[ONE] >= [TWO]',
                        arguments: {
                        ONE: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: '1'
                        },
                        TWO: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: '1'
                        }
                        }
                    },
                    {
                        opcode: 'lessThanOrEqual',
                        blockType: Scratch.BlockType.BOOLEAN,
                        text: '[ONE] <= [TWO]',
                        arguments: {
                        ONE: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: '1'
                        },
                        TWO: {
                            type: Scratch.ArgumentType.STRING,
                            defaultValue: '1'
                        }
                        }
                    },
                    {
                        opcode: 'trueBlock',
                        blockType: Scratch.BlockType.BOOLEAN,
                        text: 'true',
                    },
                    {
                        opcode: 'falseBlock',
                        blockType: Scratch.BlockType.BOOLEAN,
                        text: 'false',
                    },
                ]
            };
        }
        strictlyEquals(args) {
            // 注意严格相等：输入必须精确匹配：类型、大小写等。
            return args.ONE === args.TWO;
        }
        greaterThanOrEqual(args) {
            // 比较大于等于。
            return args.ONE >= args.TWO;
        }
        lessThanOrEqual(args) {
            // 比较小于等于。
            return args.ONE <= args.TWO;
        }
        trueBlock() {
            // 返回真。
            return true;
        }
        falseBlock() {
            // 返回假。
            return false;
        }
    }
    Scratch.extensions.register(new miniTools());
}(Scratch));