export enum Direction {
    Horizontal,
    Vertical
}

// Enums are undefined at runtime outside of the file where they were first created, so I will try and create tooling for enum enumeration here.
class EnumProvider {
    private map;
    keys;
    constructor(enum_: any) {
        this.map = (Object as any).assign(enum_);
        this.keys = Object.keys(this.map).map(k=>Number(k)).filter(nk=>!isNaN(nk));
    }
    getFromKey(k){
        return this.map[k];
    }
}
export const DirectionEnumProvider = new EnumProvider(Direction);