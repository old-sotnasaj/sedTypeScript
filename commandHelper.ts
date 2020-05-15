import * as lr from 'readline';
import * as fs from 'fs';


const cmdExpression = RegExp(`^(s)(\/)(?<oldString>.*)(\/)(?<newString>.*)(\/)(?<flags>(I|p|g|w){0,4})(?<fileName>.*)`);
const isEmpty = /^\s*$/;

export enum FLAGS {
    wFLAG = 'w',
    IFLAG = 'I',
    pFLAG = 'p',
    gFLAG = 'g'
}
export interface ReplaceExpression {
    expression: RegExp,
    newValue: string
}
export function validateSubCommand(command: string): boolean {
    let cmdGroups: { [key: string]: string; } | undefined = command.match(cmdExpression)?.groups;
    let flags: string[] | null;
    let fileName: string;
    if (cmdGroups === undefined) return false;
    fileName = cmdGroups.fileName;
    flags = getFlagsArray(command);
    if (flags === null) return false;
    if (flags.length > 0) {
        if (flags.includes(FLAGS.wFLAG)) {
            return (!isEmpty.test(fileName)) ? true : false;
        } else {
            return (isEmpty.test(fileName)) ? true : false;
        }
    }
    return (isEmpty.test(fileName)) ? true : false;
}

export function getWFileName(command: string): string {
    let cmdFlags: { [key: string]: string; } | undefined = command.match(cmdExpression)?.groups;
    if (cmdFlags !== undefined) {
        if ([...cmdFlags.flags].includes(FLAGS.wFLAG)) {
            let fileName = cmdFlags.flags.substring(cmdFlags.flags.indexOf('w') + 1);
            return `${fileName}${cmdFlags.fileName}`;
        }
        return `${cmdFlags.fileName}`
    }
    return '';
}

function checkFlags(flags: string[]): boolean {
    if (flags.length > 0) {
        for (let flag of flags) {
            if (flags.indexOf(flag) !== flags.lastIndexOf(flag)) {
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
        if ([...cmdFlags.flags].includes(FLAGS.wFLAG)) {
            return [...flags, 'w'];
        }
        return [...flags];
    }
    return [];
}

export function replaceExpression(command: string): ReplaceExpression | null {
    let cmdGroups: { [key: string]: string; } | undefined = command.match(cmdExpression)?.groups;
    if (cmdGroups != undefined) {
        let flags: string[] | null = getFlagsArray(command);
        let oldString = cmdGroups.oldString;
        if (flags != null) {
            if (flags.includes(FLAGS.gFLAG && FLAGS.IFLAG))
                return { expression: RegExp(oldString, 'ig'), newValue: cmdGroups.newString };
            if (flags.includes(FLAGS.IFLAG))
                return { expression: RegExp(oldString, 'i'), newValue: cmdGroups.newString };
            if (flags.includes(FLAGS.gFLAG))
                return { expression: RegExp(oldString, 'g'), newValue: cmdGroups.newString };
        }
        return { expression: RegExp(oldString), newValue: cmdGroups.newString };
    }
    return null;
}

export async function getCommandsFile(file: string): Promise<string[]> {
    let commandArray: string[] = [];
    let lineReader = lr.createInterface({
        input: fs.createReadStream(file),
    });
    for await (const line of lineReader) {
        commandArray.push(line.toString());
    }
    return [...commandArray];
}

