export interface IOmLib {
    lib?: "om-template"| "om-if"|"om-for"|"om-route_outle";
    type?: "componente"|"condition"|"lista";
    selector?: string;
    value?: any;
}