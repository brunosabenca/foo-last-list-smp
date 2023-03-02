'use strict';

include('menu_xxx.js');

function getMetaValues(fileInfo, tagIds) {
    let values = [];

    tagIds.every((tagId) => {
        const idx = fileInfo.MetaFind(tagId);
        if (idx === -1) {
            return true;
        }

        let count = fileInfo.MetaValueCount(idx);
        for (let i = 0; i < count; i++) {
            let value = fileInfo.MetaValue(idx, i).trim();
            if (value) {
                values.push(value);
            }
        }
        return true;
    });
    // Remove duplicates
    values = [...new Set(values)];
    return values;
}

function createButtonConfig(selectionInfo, label, metaIds, funcType) {
    let values = getMetaValues(selectionInfo, metaIds);
    let config = {
        entryText: label,
        flags: MF_GRAYED
    };

    if (!values.length) {
        return config;
    }

    config.entryText += '\t' + values[0];
    config.url = buildUrl(funcType, [values[0]]);
    config.flags = MF_STRING;

    return config;
}

function buildUrl(type, meta) {
    if (meta.length == 1) {
        switch (type) {
            case 'TAG_TRACKS':
                return `https://www.last.fm/tag/${encodeURIComponent(meta[0])}/tracks`;
            case 'ARTIST_TRACKS':
                return `https://www.last.fm/music/${encodeURIComponent(meta[0])}/+tracks`;
            case 'ARTIST_RADIO':
                return `https://www.last.fm/player/station/music/${encodeURIComponent(meta[0])}`;
            case 'USER_RADIO':
                return `https://www.last.fm/player/station/user/${encodeURIComponent(meta[0])}/library`;
            case 'USER_MIX':
                return `https://www.last.fm/player/station/user/${encodeURIComponent(meta[0])}/mix`;
            case 'USER_RECOMMENDATIONS':
                return `https://www.last.fm/player/station/user/${encodeURIComponent(meta[0])}/recommended`;
            case 'USER_LIBRARY':
                return `https://www.last.fm/user/${encodeURIComponent(meta[0])}/library/tracks`;
            case 'USER_LOVED':
                return `https://www.last.fm/user/${encodeURIComponent(meta[0])}/loved`;
            default:
                return null;
        }
    }

    if (meta.length == 2) {
        switch (type) {
            case 'ALBUM_TRACKS':
                return `https://www.last.fm/music/${encodeURIComponent(meta[0])}/${encodeURIComponent(meta[1])}`;
            case 'USER_PLAYLIST':
                return `https://www.last.fm/user/${encodeURIComponent(meta[0])}/playlists/${encodeURIComponent(meta[1])}`;
            default:
                return null;
        }
    }

    return null;
}

function _lastListMenu(parent) {
    const menu = new _menu();
    // Get current selection and metadata
    const selection = plman.ActivePlaylist !== -1 ? fb.GetFocusItem(true) : null;
    const selectionInfo = selection ? selection.GetFileInfo() : null;

    menu.newEntry({ entryText: 'Search on Last.fm:', flags: MF_GRAYED });
    menu.newEntry({ entryText: 'sep' });

    if (selectionInfo) {
        [
            ['Artist tracks', ['ARTIST', 'ALBUMARTIST'], 'ARTIST_TRACKS'],
            ['Genre & Style(s)', ['GENRE', 'STYLE', 'ARTIST GENRE LAST.FM', 'ARTIST GENRE ALLMUSIC'], 'TAG_TRACKS'],
            ['Folsonomy & Date(s)', ['FOLKSONOMY', 'OCCASION', 'ALBUMOCCASION', 'DATE'], 'TAG_TRACKS'],
            ['Mood & Theme(s)', ['MOOD', 'THEME', 'ALBUMMOOD', 'ALBUM THEME ALLMUSIC', 'ALBUM MOOD ALLMUSIC'], 'TAG_TRACKS'],
        ].forEach((args) => {
            let config = createButtonConfig(selectionInfo, ...args);
            menu.newEntry(
                {
                    entryText: config.entryText,
                    func: () => { parent.run(config.url) },
                    flags: config.flags
                }
            );
        });
    }

    menu.newEntry({ entryText: 'sep' });

    menu.newEntry({ entryText: 'Top tracks this year', func: () => { parent.run(buildUrl('TAG_TRACKS', [new Date().getFullYear().toString()])) } });

    menu.newEntry({
        entryText: 'Top tracks previous year', func: () => { parent.run(buildUrl('TAG_TRACKS', [(new Date().getFullYear() - 1).toString()])) }
    });
    menu.newEntry({ entryText: 'By url', func: () => { parent.run(null, null, null) } });

    return menu;
}