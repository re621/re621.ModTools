import { PrimitiveMap } from "../../components/Component";
import XM from "./XM";

export default class SessionStorage {

    public static SS = XM.Window.localStorage;

    private static Index = {
        n0: "r6.snt.list",
    }

    private static get = (name: string) => this.SS.getItem(name);
    private static set = (name: string, value: string) => this.SS.setItem(name, value);
    private static remove = (name: string) => this.SS.removeItem(name);

    // Staff notes to create
    public static StaffNotes = {
        get List(): Array<PrimitiveMap> {
            let data: any;
            try { data = JSON.parse(SessionStorage.get(SessionStorage.Index.n0) || "[]"); }
            catch (error) {
                console.error("Unable to parse Staff Note cache (1)");
                SessionStorage.StaffNotes.clear();
                return new Array<PrimitiveMap>();
            }

            if (!Array.isArray(data)) {
                console.error("Unable to parse Staff Note cache (2)");
                SessionStorage.StaffNotes.clear();
                return new Array<PrimitiveMap>();
            }

            return data as PrimitiveMap[];
        },
        set List(value: Array<PrimitiveMap>) {
            const text = JSON.stringify(Array.from(value));
            if (text == "[]") SessionStorage.remove(SessionStorage.Index.n0);
            else SessionStorage.set(SessionStorage.Index.n0, text);
        },

        clear() {
            SessionStorage.remove(SessionStorage.Index.n0);
        }
    }

    /**
     * Determines the current size of data in SessionStorage.  
     * @see https://stackoverflow.com/a/15720835/
     * @returns Data size, in bytes
     */
    public static size(): number {
        let _lsTotal = 0, _xLen: number, _x: string;
        for (_x in localStorage) {
            _xLen = (((localStorage[_x].length || 0) + (_x.length || 0)) * 2);
            _lsTotal += _xLen;
        }
        return _lsTotal;
    }

}
