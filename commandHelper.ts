const subExpression = RegExp(`^(s)(\/)(.*)(\/)(.*)(\/)(?<trailCommand>.*)`);
const flagsExpresion = RegExp(`(?<flags>(I|p|g|w){0,4})(?<fileName>.*)`);
const isEmpty = /^\s*$/;

export enum Flags {
    wFLAG = 'w',
    IFLAG = 'I',
    pFLAG = 'p',
    gFLAG = 'g'
}

export const groupsExp = RegExp(`^(?<command>s)\
(?<openslash>\/)\
(?<old>.*)\
(?<slash>\/)\
(?<new>.*)\
(?<closeslash>\/)\
(?<flags>(I|g|w|p|){0,4})\
(?<file>.*)`);

export function validateSubCommand(command: string): boolean {
    let commandGroups: { [key: string]: string; } | undefined = command.match(subExpression)?.groups;
    if (commandGroups !== undefined) {
        let flags = getFlagsArray(commandGroups.trailCommand);
        let fileName = getWFileName(commandGroups.trailCommand);
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


function getWFileName(trailCommand: string): string {
    let cmdFlags: { [key: string]: string; } | undefined = trailCommand.match(flagsExpresion)?.groups;
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

function getFlagsArray(trailCommand: string): string[] | null {
    let cmdFlags: { [key: string]: string; } | undefined = trailCommand.match(flagsExpresion)?.groups;
    if (cmdFlags !== undefined) {
        let flags = cmdFlags.flags.split('w', 1)[0];
        if (!checkFlags([...flags])) {
            return null
        }
        if (cmdFlags.flags.match(/.*w.*/)) {
            return [...flags, 'w'];
        }
        return [...flags];
    }
    return [];
}

export function replaceExpression(command: string, flags: string) {
    //first we checks if it is going to be both global and printed
    if (/(.*g.*I.*)|(.*I.*g.*)/.test(flags)) {
        return RegExp(command, 'ig');
    }
    //first we checks if it is going to be just global
    if (/(.*g.*)/.test(flags)) {
        return RegExp(command, 'g');
    }
    //first we checks if she is going to be just insesitive with us :C
    if (/(.*I.*)/.test(flags)) {
        return RegExp(command, 'i');
    }
    return RegExp(command);
}
