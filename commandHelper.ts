const subExpression = RegExp(
    `^(s)(\/)(.*)(\/)(.*)(\/)(?<flags>(I|p|g|w){0,4})(?<file>.*)`
);
const isEmpty = /^\s*$/;
const containsWFlag = /.*w.*/;

/*
const groupsExp = RegExp(`^(?<command>s)\
(?<openslash>\/)\
(?<old>.*)\
(?<slash>\/)\
(?<new>.*)\
(?<closeslash>\/)\
(?<flags>(I|p|g|w){0,4})\
(?<file>.*)`);


const repeatedFlag = `/([p,g,I,w])\1+/`; */

/*
enum Flags {
    wFlag = 'w',
    IFlag = 'I',
    pFlag = 'p',
    gFlag = 'g'
}*/


export function validateSubCommand(command: string): boolean {

    let commandGroups: RegExpMatchArray | null = command.match(subExpression);
    // match return null if not match
    if (commandGroups !== null) {
        // By using the expression we can be ensure thats groups.flags always exist at least as ''
        if (isEmpty.test(commandGroups.groups.flags)) {
            if (isEmpty.test(commandGroups.groups.file)) { return true } else { return false };
        } else {
            if (uniqueFlags(commandGroups.groups.flags)) {
                if (containsWFlag.test(commandGroups.groups.flags)) {
                    if (!isEmpty.test(commandGroups.groups.file)) return true;
                    console.error('Missing file name in w');
                    return false;
                } else {
                    if (!isEmpty.test(commandGroups.groups.file)) return false;
                    return true;
                }
            }
            return false;
        }
    }
    return false;
}

function uniqueFlags(flags: string) {
    for (let i = 0; i < flags.length - 1; i++) {
        for (let b = i + 1; b <= flags.length - 1; b++) {
            if (flags[i] === flags[b]) return false;
        }
    }
    return true;
}