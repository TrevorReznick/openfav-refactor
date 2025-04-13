import { atom } from 'nanostores'

/* @@ test @@ */

export const counterStore = atom(0)

/* @@ navigation @@ */

export const currentPath = atom<string>('/')
export const previousPath = atom<string>('/')

/* @@ notification @@ */

export const notifications = atom([])
export const messageStore = atom<string>('')
