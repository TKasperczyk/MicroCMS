export type TCollectionIndexType = "index" | "unique" | "sparse";
export interface TCollectionIndex {
    name: string,
    types: TCollectionIndexType[]
}