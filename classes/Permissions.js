const Permissions = [
    { permission: "BOT_ADMINISTRATOR",  value: 0x00000001 },
    { permission: "GUILD_ADMINISTRATOR",  value: 0x00000002 },
    { permission: "EDIT_USER_DATA",           value: 0x00000004 },
    { permission: "EDIT_GUILD_DATA",            value: 0x00000008 },
    { permission: "MARKETPLACE_BANNED",          value: 0x00000010 },
    { permission: "QUEUE_BOT_MUSIC",        value: 0x00000020 },
    { permission: "VIEW_GUILD_INFO",           value: 0x00000040 },
    { permission: "UPLOAD_PORTFOLIO",          value: 0x00000080 },
    { permission: "VIEW_PORTFOLIO",         value: 0x00000100 },
    { permission: "STAFF_LEVEL_1",       value: 0x00000200 },
    { permission: "STAFF_LEVEL_2",                 value: 0x00000400 },
    { permission: "STAFF_LEVEL_3",           value: 0x00000800 },
    { permission: "STAFF_LEVEL_4",          value: 0x00001000 },
    { permission: "STAFF_LEVEL_5",      value: 0x00002000 },
    { permission: "MANAGE_EVENTS",        value: 0x00004000 },
    { permission: "MANAGE_MARKETPLACE_POSTS",            value: 0x00008000 },
    { permission: "USE_BOT_REPUTATION",           value: 0x00010000 },
    { permission: "MANAGE_ANTI_RAID",   value: 0x00020000 },
    { permission: "SIMPLE_BAN_MENU",       value: 0x00040000 },
    { permission: "SIMPLE_KICK_MENU",    value: 0x00080000 },
    { permission: "SIMPLE_MUTE_MENU",    value: 0x00100000 },
    { permission: "SIMPLE_WARN_MENU",                value: 0x00200000 },
    { permission: "VIEW_SELF_INFRACTIONS",                  value: 0x00400000 },
    { permission: "VIEW_OTHER_INFRACTIONS",           value: 0x00800000 },
    { permission: "MANAGE_ACTIVITIES",         value: 0x01000000 },
    { permission: "CONFIGURE_SOCIAL_MEMES",           value: 0x02000000 },
    { permission: "VIEW_BOT_AUDIT_LOG",                value: 0x04000000 },
    { permission: "CHANGE_NICKNAME",        value: 0x08000000 },
    { permission: "MANAGE_NICKNAMES",       value: 0x10000000 },
    { permission: "MANAGE_ROLES",           value: 0x20000000 },
    { permission: "MANAGE_WEBHOOKS",        value: 0x40000000 },
    { permission: "MANAGE_EMOJIS",          value: 0x80000000 },
]

module.exports = {
    calculatePermissions(strArray) {
        let permissions = 0;
    
        strArray.forEach(value => {
            let obj = Permissions.find(o => o.permission === value);
            // console.log(value)
            if(obj) {
                permissions |= obj.value;
            }
        });
    
        return permissions;
    },

    calculateAllPermissions() {
        console.log(
            this.calculatePermissions([
                "BOT_ADMINISTRATOR",
                "GUILD_ADMINISTRATOR",
                "EDIT_USER_DATA",
                "EDIT_GUILD_DATA",
                "MARKETPLACE_BANNED",
                "QUEUE_BOT_MUSIC",
                "VIEW_GUILD_INFO",
                "UPLOAD_PORTFOLIO",
                "VIEW_PORTFOLIO",
                "STAFF_LEVEL_1",
                "STAFF_LEVEL_2",
                "STAFF_LEVEL_3",
                "STAFF_LEVEL_4",
                "STAFF_LEVEL_5",
                "MANAGE_EVENTS",
                "MANAGE_MARKETPLACE_POSTS",
                "USE_BOT_REPUTATION",
                "MANAGE_ANTI_RAID",
                "SIMPLE_BAN_MENU",
                "SIMPLE_KICK_MENU",
                "SIMPLE_MUTE_MENU",
                "SIMPLE_WARN_MENU",
                "VIEW_SELF_INFRACTIONS",
                "VIEW_OTHER_INFRACTIONS",
                "MANAGE_ACTIVITIES",
                "CONFIGURE_SOCIAL_MEMES",
                "VIEW_BOT_AUDIT_LOG",
                "CHANGE_NICKNAME",
                "MANAGE_NICKNAMES",
                "MANAGE_ROLES",
                "MANAGE_WEBHOOKS",
                "MANAGE_EMOJIS"
            ])
        );
        return 0;
    },

    hasPermission(permissionName, permissionsInteger) {
        let obj = Permissions.find(o => o.permission === permissionName);
        if(obj)
            return ((permissionsInteger & obj.value) == obj.value);
        else
            return false;
    }
}