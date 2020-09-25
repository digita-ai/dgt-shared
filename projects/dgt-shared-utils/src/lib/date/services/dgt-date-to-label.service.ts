import { Injectable } from '@angular/core';
import moment from 'moment';
import { DGTErrorArgument } from '../../errors/models/dgt-error-argument.model';

@Injectable()
export class DGTDateToLabelService {

    constructor() { }

    public dateToReadableString(date: Date): string {
        if (!date) {
            throw new DGTErrorArgument('date should be set.', date);
        }

        if (moment(date).isSame(moment(), 'day')) {
            return 'Today';
        } else if (moment(date).isSame(moment().subtract(1, 'days'), 'day')) {
            return 'Yesterday';
        } else {
            return date.toDateString();
        }
    }

    public dateToTimeAgoString(date: Date): string {
        if (!date) {
            throw new DGTErrorArgument('date should be set.', date);
        }

        const now = moment(new Date());
        const duration = moment.duration(now.diff(date));
        const minutes = Math.round(duration.asMinutes());
        if (minutes < 60) {
            if (minutes < 2) {
                return 'Just Now';
            } else {
                return minutes + ' minutes ago';
            }
        } else {
            const hours = Math.round(duration.asHours());
            if (hours < 24) {
                return hours + (hours === 1 ? ' hour ago' : ' hours ago');
            } else {
                const days = Math.round(duration.asDays());
                if (days < 31) {
                    return days + (days === 1 ? ' day ago' : ' days ago');
                } else {
                    const months = Math.round(duration.asMonths());
                    if (months < 12) {
                        return months + (months === 1 ? ' month ago' : ' months ago');
                    } else {
                        const years = Math.round(duration.asYears());
                        return years + (years === 1 ? ' year ago' : ' years ago');
                    }
                }
            }
        }
    }
}