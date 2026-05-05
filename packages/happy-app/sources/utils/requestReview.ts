import { MMKV } from 'react-native-mmkv';
import { Modal } from '@/modal';
import { t } from '@/text';
import { AsyncLock } from './lock';
import {
    trackReviewPromptShown,
    trackReviewPromptResponse,
    trackReviewRetryScheduled
} from '@/track';
import { sync } from '@/sync/sync';
import { storage as syncStorage } from '@/sync/storage';
import { Platform } from 'react-native';

const localStorage = new MMKV();

const LOCAL_KEYS = {
    STORE_REVIEW_LAST_SHOWN: 'review_store_last_shown',
    DECLINED_AT: 'review_declined_at',
} as const;

const RETRY_DAYS = 30;
const DAY_IN_MS = 24 * 60 * 60 * 1000;
const lock = new AsyncLock();

export function requestReview() {
    if (Platform.OS === 'web') {
        return;
    }

    lock.inLock(async () => {
        try {
            const settings = syncStorage.getState().settings;

            if (settings.reviewPromptAnswered) {
                return;
            }

            const declinedAtStr = localStorage.getString(LOCAL_KEYS.DECLINED_AT);
            if (declinedAtStr) {
                const declinedAt = new Date(declinedAtStr);
                const now = new Date();
                const daysSinceDeclined = (now.getTime() - declinedAt.getTime()) / DAY_IN_MS;

                if (daysSinceDeclined < RETRY_DAYS) {
                    return;
                }
            }

            trackReviewPromptShown();
            const likesApp = await Modal.confirm(
                t('review.enjoyingApp'),
                t('review.feedbackPrompt'),
                {
                    confirmText: t('review.yesILoveIt'),
                    cancelText: t('review.notReally'),
                }
            );
            trackReviewPromptResponse(likesApp);

            sync.applySettings({
                reviewPromptAnswered: true,
                reviewPromptLikedApp: likesApp,
            });

            if (!likesApp) {
                localStorage.set(LOCAL_KEYS.DECLINED_AT, new Date().toISOString());
                trackReviewRetryScheduled(RETRY_DAYS);
                return;
            }

        } catch (error) {
            console.error('Error requesting review:', error);
        }
    });
}

export function resetReviewState(): void {
    localStorage.delete(LOCAL_KEYS.DECLINED_AT);
    localStorage.delete(LOCAL_KEYS.STORE_REVIEW_LAST_SHOWN);

    sync.applySettings({
        reviewPromptAnswered: false,
        reviewPromptLikedApp: null,
    });
}
