import { emplace } from 'svelte-emplace';

export const pageTitle = emplace({ key: 'title' });
export const toolbar = emplace({ key: 'tools', mode: 'multiple' });
