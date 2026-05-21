import React from 'react';

interface InlineNoticeProps {
    tone?: 'error' | 'info' | 'success' | 'warning';
    children: React.ReactNode;
}

export const InlineNotice: React.FC<InlineNoticeProps> = ({
    tone = 'error',
    children,
}) => {
    const styles = {
        error: 'text-red-500 bg-red-50 border-red-100 dark:bg-red-900/10 dark:border-red-900/20',
        info: 'text-blue-600 bg-blue-50 border-blue-100 dark:bg-blue-900/10 dark:border-blue-900/20',
        success: 'text-emerald-600 bg-emerald-50 border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-900/20',
        warning: 'text-amber-600 bg-amber-50 border-amber-100 dark:bg-amber-900/10 dark:border-amber-900/20',
    };

    return (
        <div className={`p-3 text-xs font-medium border rounded-lg ${styles[tone]}`}>
            {children}
        </div>
    );
};