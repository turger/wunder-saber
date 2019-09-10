const store = window.localStorage || {getItem: () => '', setItem: () => {}};

export const getDefaultUsername = () => store.getItem('name') || '';
export const setDefaultUsername = (name) => store.setItem('name', value)

export const getDefaultDifficulty = () => store.getItem('difficulty') || 'Easy';
export const setDefaultDifficulty = (difficulty) => store.setItem('difficulty', difficulty);
