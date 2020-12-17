import { lastValueFrom, timer } from 'rxjs';
import { take } from 'rxjs/operators';

export const wait = async (ms: number): Promise<void> => {
    await lastValueFrom(timer(ms).pipe(take(1)));
};
