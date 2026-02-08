import { Habit, CheckInsMap } from '@/store/useHabitStore';

interface ExportData {
    version: number;
    habits: Habit[];
    checkIns: CheckInsMap;
    exportedAt: string;
}

export const downloadData = (habits: Habit[], checkIns: CheckInsMap) => {
    const data: ExportData = {
        version: 1,
        habits,
        checkIns,
        exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `habit-tracker-backup-${new Date().toISOString().split('T')[0]}.habittrack`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

export const parseImportData = (file: File): Promise<ExportData> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result as string;
                const data = JSON.parse(text);
                // Basic validation could go here
                if (!data.habits || !data.checkIns) {
                    reject(new Error("Invalid file format"));
                }
                resolve(data as ExportData);
            } catch (err) {
                reject(err);
            }
        };
        reader.onerror = (err) => reject(err);
        reader.readAsText(file);
    });
};
