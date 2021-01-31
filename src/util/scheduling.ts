import { timer } from 'rxjs';
import { take } from 'rxjs/operators';

export const wait = async (ms: number): Promise<void> => {
    await timer(ms).pipe(take(1)).toPromise();
};
