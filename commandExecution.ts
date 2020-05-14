import * as fs from 'fs';
import {validateSubCommand, groupsExp, replaceExpression} from './commandHelper';
import {writeToFile, replaceFile} from './fileManager';
import * as readLine from 'readline';


interface Options{
    expression: string[],
    silent: boolean,
    inPlace: boolean,
    files: string
}

export function executeCommand(sedCMDS: string, file: string, options: Options) {
    let patternSpace; // patternSpace .....
    let defualtWFlagFile = 'bak.up'; // w flag file
    let wFlag = false; // w flag
    let printDemand = false; // By p flag
    let match = false;
    let stringPipe = ''; // to write later
    let lineReader = readLine.createInterface({ input: fs.createReadStream(file) });
  
    lineReader.on('line', function (line:string) {
      let replaceCMD: RegExp;
      let command: { [key: string]: string; } | undefined;
      patternSpace = line.toString(); // Fill patterspace with original content
  
      for (let cmd of sedCMDS) {
        if (!validateSubCommand(cmd)) {
          //throw new Error('Some of the commands seems to be wrong --> '+cmd+' <--');
          // ----> just for avoid the big output of throw
          console.log(
            'Some of the commands seems to be wrong --> ' + cmd + ' <--'
          );
          process.exit();
        }
  
        match = false; //reset match every loop
        command = groupsExp.exec(cmd)?.groups; // get named groups of Regex
        // Generate the equivalent command to be applied
        replaceCMD = replaceExpression(command.old, command.flags);
  
        if (/(.*p.*)/.test(command.groups.flags)) printDemand = true; // print by demand
        if (replaceCMD.test(patternSpace)) match = true; // to check if it match (to print)
        //respective replacement of the content
        patternSpace = patternSpace.replace(replaceCMD, command.groups.new);
  
        // checks for W flag
        if (/(.*w.*)/.test(command.groups.flags)) {
          wFlag = true;
          if (command.groups.file != undefined && /\S/.test(command.groups.file)) {
            defualtWFlagFile = command.groups.file;
            defualtWFlagFile = defualtWFlagFile.replace(/ /g, ''); // we dont want white
          }
        }
      }
      if (!options.n) {
        console.log(patternSpace); // we print every time....but we save once
        if(match){
          stringPipe += patternSpace + '\n';
        }
        if (printDemand && match) {
          console.log(patternSpace); // we print every time....but we save once
          stringPipe += patternSpace + '\n';
        }
      } else {
        if(match){
          stringPipe += patternSpace + '\n';
        }
      }
      
    });

    lineReader.on('close', () => {
        if (wFlag) writeToFile(defualtWFlagFile, stringPipe);
        if (options.inPlace) replaceFile(file, defualtWFlagFile, stringPipe);
      });
    }



