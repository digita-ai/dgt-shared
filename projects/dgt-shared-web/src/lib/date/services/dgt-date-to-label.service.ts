
import { DGTErrorArgument, DGTInjectable } from '@digita-ai/dgt-shared-utils';
import { TranslateService } from '@ngx-translate/core';
import moment from 'moment';
import { Observable, of } from 'rxjs';

@DGTInjectable()
export class DGTDateToLabelService {

    constructor(
        private translate: TranslateService,
    ) { }

    public dateToReadableString(date: Date): Observable<string> {
        if (!date) {
            throw new DGTErrorArgument('date should be set.', date);
        }

        if (moment(date).isSame(moment(), 'day')) {
            return this.translate.get('common.date.today');
        } else if (moment(date).isSame(moment().subtract(1, 'days'), 'day')) {
            return this.translate.get('common.date.yesterday');
        } else {
            return of(date.toDateString());
        }
    }

    public dateToTimeAgoString(date: Date): Observable<string> {
        if (!date) {
            throw new DGTErrorArgument('date should be set.', date);
        }

        const now = moment(new Date());
        const duration = moment.duration(now.diff(date));
        const minutes = Math.round(duration.asMinutes());
        if (minutes < 60) {
            if (minutes < 2) {
                return this.translate.get('common.date.justNow');
            } else {
                return this.translate.get('common.date.minutesAgo', {minutes});
            }
        } else {
            const hours = Math.round(duration.asHours());
            if (hours < 24) {
                return hours === 1 ? this.translate.get('common.date.hourAgo', { hours }) :
                    this.translate.get('common.date.hoursAgo', { hours });
            } else {
                const days = Math.round(duration.asDays());
                if (days < 31) {
                    return days === 1 ? this.translate.get('common.date.dayAgo', { days }) :
                        this.translate.get('common.date.daysAgo', { days });
                } else {
                    const months = Math.round(duration.asMonths());
                    if (months < 12) {
                        return months === 1 ? this.translate.get('common.date.monthAgo', { months }) :
                            this.translate.get('common.date.monthsAgo', { months });
                    } else {
                        const years = Math.round(duration.asYears());
                        return years === 1 ? this.translate.get('common.date.yearAgo', { years }) :
                            this.translate.get('common.date.yearsAgo', { years });
                    }
                }
            }
        }
    }
}
