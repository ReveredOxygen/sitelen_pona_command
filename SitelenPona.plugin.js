/**
 * @name SitelenPona
 * @author jan Asikin
 * @description Adds /os to send a sitelen pona image
 * @version 0.0.1
 * @authorId 799421831819165717
 * @authorLink https://github.com/ReveredOxygen/
 * @website https://github.com/ReveredOxygen/sitelen_pona_command
 * @source https://github.com/ReveredOxygen/sitelen_pona_command
 */
"use strict"

const command = {
    applicationId: "betterdiscord",
    description: "Send a sitelen pona image of the text",
    displayDescription: "Send a sitelen pona image of the text",
    displayName: "sitelen pona",
    inputType: 0,
    type: 1,
    name: readSettings().commandName,
    options: [
        { name: 'text', description: 'text to draw', type: 3, required: true },
        { name: 'message_content', description: 'raw text to include in the message', type: 3, required: false }
    ],
    id: 'sitelen_pona_gen',
    execute: execCommand,
    predicate: (() => true)
}

function execCommand(options, props) {
    let settings = readSettings()
    let message = ''

    if (options[1]) { message = options[1].value }

    renderText(options[0].value, settings).toBlob((x) => {
        let { uploadFiles } = BdApi.findModuleByProps('instantBatchUpload')
        uploadFiles({
            channelId: props.channel.id,
            uploads: [
                {
                    item: {
                        file: new File([x], 'sitelen_pona.png'),
                        platform: 1,
                    },
                    id: 'sitelen_pona_upload',
                    classification: 'image',
                    isImage: true,
                    isVIdeo: false,
                    filename: 'sitelen_pona.png',
                    showLargeMessageDialog: false,
                    spoiler: false,
                    description: options[0].value,
                }
            ],
            draftType: 0,
            parsedMessage: {
                content: message,
                tts: false,
                invalidEmojis: [],
                validNonShortcutEmojis: [],
            },
            options: {
                stickerIds: [],
            },
        })
    })
}

function renderText(text, config) {
    let canvas = document.createElement('canvas')
    let ctx = canvas.getContext('2d')

    ctx.font = config.fontSize + 'px ' + config.font;
    // https://github.com/lipu-linku/ilo/blob/3404a4b8fdc1021acddb91f115369c7c928e2dec/sitelen.py#L6
    let strokeWidth = config.fontSize / 133 * config.borderWidth * 2.25


    let metrics = ctx.measureText(text)
    let width = 0

    let lines = text.split(config.newline).map((x) => x.split('\n'))

    for (let line of lines) {
        let newWidth = ctx.measureText(line).width

        if (newWidth > width) {
            width = newWidth
        }
    }

    let padding = 2 * strokeWidth
    let fontHeight = metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent

    let line1Metrics = ctx.measureText(lines[0])
    let line1Height = line1Metrics.actualBoundingBoxAscent + line1Metrics.fontBoundingBoxDescent
    let line1Ascent = line1Metrics.actualBoundingBoxAscent

    canvas.width = width + padding
    canvas.height = fontHeight * (lines.length - 1) + line1Height + padding

    ctx.font = config.fontSize + 'px ' + config.font;
    ctx.strokeStyle = config.borderColor
    ctx.lineWidth = strokeWidth
    ctx.lineJoin = 'round';
    ctx.fillStyle = config.textColor

    for (let i = 0; i < lines.length; i++) {
        ctx.strokeText(lines[i], strokeWidth, (fontHeight * i) + padding + line1Ascent)
    }

    for (let i = 0; i < lines.length; i++) {
        ctx.fillText(lines[i], strokeWidth, (fontHeight * i) + padding + line1Ascent)
    }

    return canvas
}

module.exports = class SitelenPona {
    start() {
        // from https://rauenzi.github.io/BDPluginLibrary/docs/tutorial-getting-started.html
        if (!global.ZeresPluginLibrary) {
            BdApi.alert("Library Missing",`The library plugin needed for ${this.getName()} is missing.<br />You can use the plugin, but attempting to change any settings will result in a crash.<br /><br /> <a href="https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js" target="_blank">Click here to download the library!</a>`);
        }


        BdApi.findModuleByProps("BUILT_IN_COMMANDS").BUILT_IN_COMMANDS.push(command)

        // For some reason the ligature fails the first time, so let's just do it once and discard it
        renderText('ma o toki', readSettings())
    } // Required function. Called when the plugin is activated (including after reloads)

    stop() {
        // https://github.com/BetterDiscordBuilder/bdbuilder/blob/41c4fd9fb5b08d791f2d37af431f75e2584f2f21/common/apis/commands.ts#L81
        let commands = BdApi.findModuleByProps("BUILT_IN_COMMANDS").BUILT_IN_COMMANDS

        let index = commands.indexOf(command)
        if (index < 0) { return }
        commands.splice(index, 1)
    } // Required function. Called when the plugin is deactivated

    getSettingsPanel() {
        let current = readSettings()

        function saveCallback(key) {
            return (value) => BdApi.saveData('SitelenPona', key, value)
        }

        function saveCallbackNumber(key) {
            return (value) => BdApi.saveData('SitelenPona', key, Number(value))
        }

        return new ZLibrary.Settings.SettingPanel((x) => {}, 
            new ZLibrary.Settings.ColorPicker('Text Color', 'The main color of the text', current.textColor, saveCallback('textColor'), { defaultColor: '#ffffff' }),
            new ZLibrary.Settings.Textbox('Font size', 'The font size used for rendering the text (default=72)', current.fontSize, saveCallbackNumber('fontSize')),
            new ZLibrary.Settings.Textbox('Font', 'The font to render sitelen pona with', current.font, saveCallback('font')),
            new ZLibrary.Settings.Textbox('Border width', 'The size of the border around the text. It exists to make the text visible on light mode. Please don\'t mess with this for actual chat, as that might make it inaccessible for light mode users.\nThis value multiplies the font size, so it\'ll always be consistent. The code to do this is from ilo Linku at https://github.com/lipu-linku/ilo/blob/main/sitelen.py#L6', current.borderWidth, saveCallbackNumber('borderWidth')),
            new ZLibrary.Settings.ColorPicker('Border color', 'The color of the border around the text. It exists to make the text visible on light mode. Please don\'t set this to a color that would make it inaccessible for light mode users.', current.borderColor, saveCallback('borderColor'), { defaultColor: '#36393f' }),
            new ZLibrary.Settings.Textbox('Command name', 'The command to render sitelen pona (default=os, from "o sitelen")', current.commandName, saveCallback('commandName')),
            new ZLibrary.Settings.Textbox('Newline symbol', 'If you type this in your message, it will go to the next line. It\'s annoying this is necessary but you can\'t type newlines so it is', current.newline, saveCallback('newline')),
        ).getElement()
    }
}

function readSettings() {
    function load(key) { return BdApi.loadData('SitelenPona', key) }

    return {
        textColor: load('textColor') || '#ffffff',
        fontSize: load('fontSize') || 72,
        font: load('font') || '"linja sike 5"',
        borderWidth: load('borderWidth') || 5,
        borderColor: load('borderColor') || '#36393f',
        commandName: load('commandName') || 'os',
        newline: load('newline') || '|'
    }
}

