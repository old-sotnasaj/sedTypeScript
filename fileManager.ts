import * as fs from 'fs';

export function checkReadExist(file: string): boolean {
    fs.access(file, fs.constants.F_OK | fs.constants.R_OK, err => {
        if (err) {
            console.error(err);
            return false;
        }
    });
    return true;
}

export async function replaceFile(oldFile: string, newFile: string, content: string) {
    fs.writeFile(newFile, content, (err) => {
        if (err) throw err;
        fs.unlink(oldFile, (err) => {
            if (err) throw err;
            fs.rename(newFile, oldFile, err => {
                if (err) throw err;
                console.log(`\n File replaced [-i] ${oldFile} \n`);
            })
        })
    });
}

export async function writeToFile(file: string, content: string) {
    file = file.trim();
    fs.writeFile(file, content,err => {
        if (err) throw err;
        console.log(`\n File Created [ /w ] ${file} \n`);
    })
}

