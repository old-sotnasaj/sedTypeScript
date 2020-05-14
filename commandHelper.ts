const cmdExpression = RegExp(`^(s)(\/)(?<oldString>.*)(\/)(?<newString>.*)(\/)(?<flags>(I|p|g|w){0,4})(?<fileName>.*)`);
//const flagsExpresion = RegExp(`(?<flags>(I|p|g|w){0,4})(?<fileName>.*)`);
const isEmpty = /^\s*$/;

export enum Flags {
    wFLAG = 'w',
    IFLAG = 'I',
    pFLAG = 'p',
    gFLAG = 'g'
}

export function validateSubCommand(command: string): boolean {
    let cmdGroups: { [key: string]: string; } | undefined = command.match(cmdExpression)?.groups;
    if (cmdGroups !== undefined) {
        let flags = getFlagsArray(command);
        let fileName = getWFileName(command);
        if (flags === null) {
            console.error('Bad flags');
        } else {
            if (flags.length === 0) {
                if (isEmpty.test(fileName)) {
                    return true;
                } else {
                    console.error('Bad flags');
                    return false;
                }
            } else {
                if (flags.includes(Flags.wFLAG) && !isEmpty.test(fileName)) {
                    return true;
                } else {
                    console.error('File Name not specified');
                }
            }
        }

    }
    console.error('Bad command');
    return false;
}

export function getWFileName(command: string): string {
    let cmdFlags: { [key: string]: string; } | undefined = command.match(cmdExpression)?.groups;
    if (cmdFlags !== undefined) {
        let fileName = cmdFlags.flags.substring(cmdFlags.flags.indexOf('w') + 1);
        return `${fileName}${cmdFlags.fileName}`;
    }
    return '';
}

function checkFlags(flags: string[]): boolean {
    if (flags.length > 0) {
        for (let flag of flags) {
            if (flags.indexOf(flag) !== flags.lastIndexOf(flag)) {
                console.error('Repeated flags');
                return false;
            }
        }
    }
    return true
}

export function getFlagsArray(command: string): string[] | null {
    let cmdFlags: { [key: string]: string; } | undefined = command.match(cmdExpression)?.groups;
    if (cmdFlags !== undefined) {
        let flags = cmdFlags.flags.split('w', 1)[0];
        if (!checkFlags([...flags])) {
            return null
        }
        if ([...cmdFlags.flags].includes(Flags.wFLAG)) {
            return [...flags, 'w'];
        }
        return [...flags];
    }
    return [];
}

export function replaceExpression(command: string): [RegExp, string] | null {
    let cmdGroups: { [key: string]: string; } | undefined = command.match(cmdExpression)?.groups;
    if (cmdGroups != undefined) {
        let flags: string[] | null = getFlagsArray(command);
        let oldString = cmdGroups.oldString;
        if (flags != null) {
            if (flags.includes(Flags.gFLAG && Flags.IFLAG))
                return [RegExp(oldString, 'ig'), cmdGroups.oldString];
            if (flags.includes(Flags.IFLAG))
                return [RegExp(oldString, 'i'), cmdGroups.oldString];
            if (flags.includes(Flags.gFLAG))
                return [RegExp(oldString, 'g'), cmdGroups.oldString];
        }
        return [RegExp(oldString), cmdGroups.oldString];
    }
    return null;
}