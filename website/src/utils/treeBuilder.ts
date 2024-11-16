import type { HubSpotTemplate } from '../types/HubSpotTemplate';
import type { HubSpotPage } from '../types/HubSpotPage';

type TreeItem = HubSpotTemplate | HubSpotPage;

export function buildTree<T extends TreeItem>(items: T[]): any {
    const tree = {};
    items.forEach(item => {
        const path = 'path' in item ? item.path : item.templatePath || 'No Template';
        const parts = path.split('/');
        let currentLevel = tree;
        parts.forEach((part, index) => {
            if (!currentLevel[part]) {
                if (index === parts.length - 1) {
                    // This is the leaf node
                    currentLevel[part] = item;
                } else {
                    // This is an intermediate directory
                    currentLevel[part] = {};
                }
            }
            currentLevel = currentLevel[part];
        });
    });
    return tree;
}