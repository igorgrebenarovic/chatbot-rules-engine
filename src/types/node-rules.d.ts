/** Declaration file generated by dts-gen */

export = node_rules;

declare class node_rules {
    constructor(rules: any, options: any);

    execute(fact: any, callback: any): any;

    findRules(filter: any): any;

    fromJSON(rules: any): any;

    init(rules: any): void;

    prioritize(priority: any, filter: any): void;

    register(rules: any): void;

    sync(): any;

    toJSON(): any;

    turn(state: any, filter: any): void;

}

declare namespace node_rules {
    function execute(fact: any, callback: any): any;

    function findRules(filter: any): any;

    function fromJSON(rules: any): any;

    function init(rules: any): void;

    function prioritize(priority: any, filter: any): void;

    function register(rules: any): void;

    function sync(): any;

    function toJSON(): any;

    function turn(state: any, filter: any): void;

    namespace execute {
        const prototype: {};

    }

    namespace findRules {
        const prototype: {};

    }

    namespace fromJSON {
        const prototype: {};

    }

    namespace init {
        const prototype: {};

    }

    namespace prioritize {
        const prototype: {};

    }

    namespace register {
        const prototype: {};

    }

    namespace sync {
        const prototype: {};

    }

    namespace toJSON {
        const prototype: {};

    }

    namespace turn {
        const prototype: {};

    }
}