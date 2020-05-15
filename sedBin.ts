#!/usr/bin/env node

import * as yargs from 'yargs';
import { checkReadExist } from './fileManager';
import { executeCommand } from './commandExecution'
import { getCommandsFile } from './commandHelper'

export interface Options {
    silent: boolean,
    expression: string[] | undefined,
    inPlace: boolean,
    file: string | undefined
}

// export.command ¿? export.handler ¿? --read to improve
const argv = yargs
    .usage('Usage: $0 [options] <cmd>')
    .options({
        expression: {
            describe: 'Regex to be executed',
            array: true,
            alias: 'e',
            demandOption: false,
            nargs: 1,
            type: 'string',
        },
        silent: {
            describe: 'Flush the output of the match',
            array: false,
            alias: ['quiet', 'n'],
            demandOption: false,
            nargs: 0,
            type: 'boolean',
            default: false,
        },
        inPlace: {
            describe: 'Substitution in place, for a backup a [suffix] is necessary',
            array: false,
            alias: 'i',
            demandCommand: false,
            nargs: 0,
            type: 'boolean',
            default: false,
        },
        file: {
            describe: 'You can specified a file with commands',
            array: false,
            alias: 'f',
            demandCommand: false,
            type: 'string',
        },
    })
    .command('$0 <path>', '***IMPORTANTE ',
        (yargs) => {
            yargs.positional('path', {
                describe: 'File to be processed',
                type: 'string',
                array: false,
                demandOption: true,

            });
        }
    )
    .check((yargs) => {
        if (checkReadExist(yargs.path as string)) {
            return true;
        }
        throw new Error('Some files seems to be wrong, give them a check ;) ');
    })
    .check((yargs) => {
        if (yargs.file === undefined) {
            return true;
        } else {
            if (checkReadExist(yargs.f as string)) {
                return true;
            }
            throw new Error(
                'The file with commands seems to be wrong, give it a check ;) '
            );
        }
    })
    .demandCommand(1, 1).argv;

let options: Options = {
    silent: argv.silent,
    inPlace: argv.inPlace,
    expression: argv.expression,
    file: argv.file,
};

entryPoint();

async function entryPoint(){

    if (argv.file !== undefined) {
        let commands: string[] = await getCommandsFile(argv.file);
        if (commands === null) {
            process.exit();
        }
        if (argv.expression !== undefined && argv.expression.length > 0) {
            executeCommand([...commands, ...argv.expression], argv.path as string, options);
        } else {
            executeCommand(commands, argv.path as string, options);
        }
    }
    // Executed when -e argument is provided (or multiple)
    // Also the first positional argument is overrided but required (*Behaviour to be fix)
    else if (argv.expression !== undefined) {
        executeCommand(argv.expression, argv.path as string, options);
    }
    // if both a and b are not provided,
    else {
        console.log(
            'At least one -e command or a file with commands should be provided'
        );
        process.exit();
    }
}
