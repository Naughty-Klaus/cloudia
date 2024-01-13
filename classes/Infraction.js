module.exports = class Infraction {
    constructor(userId, infractionType, infractionReason, infractionPoints, infractionExpiration) {
        this.userId = userId;
        this.infractionReason = infractionReason;
        this.infractionPoints = infractionPoints;
        this.infractionExpiration = infractionExpiration;

        switch(infractionType) {
            case "mute":
            case "Mut":
                this.infractionType = "mute";
                break;
            case "ban":
            case "Bann":
                this.infractionType = "ban";
                break;
            case "Kick":
                this.infractionType = "kick";
                break;
            case "Warn":
                this.infractionType = "warn";
                break;
        }
    }

    getType() {
        return this.infractionType;
    }
}