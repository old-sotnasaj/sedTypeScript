import * as fs from 'fs';
import {
  FLAGS, ReplaceExpression, replaceExpression,
  validateSubCommand, getFlagsArray, getWFileName
} from './commandHelper';
import { replaceFile, writeToFile } from './fileManager';
import { Options } from './sedBin';
import * as readLine from 'readline';

const BAKUP = 'bak.up';
export function executeCommand(commands: string[], file: string, options: Options) {
  let patternSpace: string; // patternSpace .....
  let wFlag = false; // w flag
  let printDemand = false; // By p flag
  let match = false;
  let stringPipe = ''; // to write later
  let lineReader = readLine.createInterface({ input: fs.createReadStream(file) });
  let flags: string[] | null;
  let wFile: string;

  // First we check all the commands before start usign them
  for (let cmd of commands) {
    if (validateSubCommand(cmd) === false) {
      console.error('Some of the commands seems to be wrong --> ' + cmd + ' <--');
      process.exit();
    }
  }

  lineReader.on('line', function (line: string) {
    let replaceCMD: ReplaceExpression | null;
    patternSpace = line.toString(); // Fill patterspace with original content

    for (let cmd of commands) {
      match = false; //reset match every loop
      // Generate the equivalent command to be applied on every match
      replaceCMD = replaceExpression(cmd);
      flags = getFlagsArray(cmd);
      wFile = getWFileName(cmd);
      if (replaceCMD === null || flags === null) process.exit();
      if (flags.includes(FLAGS.pFLAG)) printDemand = true; // activate print by demand
      if (replaceCMD.expression.test(patternSpace)) match = true; // activate match
      //respective replacement of the content
      patternSpace = patternSpace.replace(replaceCMD.expression, replaceCMD.newValue);
      // checks for W flag 
      if (flags.includes(FLAGS.wFLAG)) wFlag = true;
    }
    switch (true) {

      case options.silent && match && printDemand:
        console.log(patternSpace);
        stringPipe += patternSpace + '\n';
        break;

      case options.silent && match:
        stringPipe += patternSpace + '\n';
        break;

      case options.silent:
        break;

      case match && printDemand:
        console.log(patternSpace);
        console.log(patternSpace);
        stringPipe += patternSpace + '\n';
        break;

      case match:
        console.log(patternSpace);
        stringPipe += patternSpace + '\n';
        break;

      default:
        console.log(patternSpace);
        break;
    }
  });

  lineReader.on('close', () => {
    if (wFlag) writeToFile(wFile, stringPipe);
    if (options.inPlace) replaceFile(file, BAKUP, stringPipe);
  });
}