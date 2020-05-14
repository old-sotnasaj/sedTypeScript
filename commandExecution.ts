import * as fs from 'fs';
import { Flags, replaceExpression, validateSubCommand, getFlagsArray, getWFileName } from './commandHelper';
import {replaceFile,writeToFile} from './fileManager';
import * as readLine from 'readline';

export interface Options {
  expression: string[],
  silent: boolean,
  inPlace: boolean,
  files: string
}

export function executeCommand(commands: string, file: string, options: Options) {
  let patternSpace: string; // patternSpace .....
  let wFlag = false; // w flag
  let printDemand = false; // By p flag
  let match = false;
  let stringPipe = ''; // to write later
  let lineReader = readLine.createInterface({ input: fs.createReadStream(file) });
  let flags: string[] | null;
  let wFile: string;

  lineReader.on('line', function (line: string) {
    let replaceCMD: [RegExp, string] | null;
    patternSpace = line.toString(); // Fill patterspace with original content

    for (let cmd of commands) {
      if (!validateSubCommand(cmd)) {
        console.error('Some of the commands seems to be wrong --> ' + cmd + ' <--');
        process.exit();
      }
      match = false; //reset match every loop
      // Generate the equivalent command to be applied on every match
      replaceCMD = replaceExpression(cmd);
      flags = getFlagsArray(cmd);
      wFile = getWFileName(cmd);

      if (replaceCMD == null || flags == null) process.exit();


      if (flags.includes(Flags.pFLAG)) printDemand = true; // activate print by demand
      if (replaceCMD[0].test(patternSpace)) match = true; // activate match
      //respective replacement of the content
      patternSpace = patternSpace.replace(replaceCMD[0], replaceCMD[1]);
      // checks for W flag
      if (flags.includes(Flags.wFLAG)) wFlag = true;
    }


    switch (true) {
      case options.silent && match && printDemand:
        console.log(patternSpace);
        stringPipe += patternSpace + '\n';
        break;

      case match && printDemand:
        console.log(patternSpace);
        console.log(patternSpace);
        stringPipe += patternSpace + '\n';
        break;

      case options.silent && match:
        stringPipe += patternSpace + '\n';
        break;

      case match:
        console.log(patternSpace);
        stringPipe += patternSpace + '\n';

      default:
        console.log(patternSpace);
        break;
    }
  });

  lineReader.on('close', () => {
    if (wFlag) writeToFile(wFile, stringPipe);
    if (options.inPlace) replaceFile(file, wFile, stringPipe);
  });
}



