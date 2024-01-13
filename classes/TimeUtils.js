module.exports = {
    addTime(input) {
        const regex = /(\d+)\s*(year|month|day|hour|minute|second|yr|mo|hr|min|sec)s?/gi;
        const matches = input.matchAll(regex);

        let currentDate = new Date();
        let timestamp = -1;

        for (const match of matches) {
            const amount = parseInt(match[1]);
            const unit = match[2].toLowerCase();

            if (isNaN(amount)) {
                console.log('Invalid input:', match[0]);
                continue;
            }

            switch (unit) {
                case 'year':
                case 'yr':
                    currentDate.setFullYear(currentDate.getFullYear() + amount);
                    break;
                case 'month':
                case 'mo':
                    currentDate.setMonth(currentDate.getMonth() + amount);
                    break;
                case 'day':
                    currentDate.setDate(currentDate.getDate() + amount);
                    break;
                case 'hour':
                case 'hr':
                    currentDate.setHours(currentDate.getHours() + amount);
                    break;
                case 'minute':
                case 'min':
                    currentDate.setMinutes(currentDate.getMinutes() + amount);
                    break;
                case 'second':
                case 'sec':
                    currentDate.setSeconds(currentDate.getSeconds() + amount);
                    break;
                default:
                    console.error('Invalid unit:', unit);
                    continue;
            }

            timestamp = currentDate.getTime();
        }

        return timestamp;
    },

    getFormattedDateTime(timestamp) {
        const date = new Date(timestamp);

        const months = [
            'January', 'February', 'March', 'April', 'May', 'June', 'July',
            'August', 'September', 'October', 'November', 'December'
        ];

        const month = months[date.getMonth()];
        const day = date.getDate();
        const year = String(date.getFullYear());

        let hours = date.getHours();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12 || 12;

        const minutes = String(date.getMinutes()).padStart(2, '0');

        let daySuffix;
        if (day >= 11 && day <= 13) {
            daySuffix = 'th';
        } else {
            switch (day % 10) {
                case 1:
                    daySuffix = 'st';
                    break;
                case 2:
                    daySuffix = 'nd';
                    break;
                case 3:
                    daySuffix = 'rd';
                    break;
                default:
                    daySuffix = 'th';
            }
        }

        const formattedDateTime = `${month}, ${day}${daySuffix} ${year} ${hours}:${minutes}${ampm}`;

        return formattedDateTime;
    }

}