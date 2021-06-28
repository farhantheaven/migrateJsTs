#!/home/farhan/.nvs/default/bin/node
const { addConversionsPlugin,jsDocPlugin,declareMissingClassPropertiesPlugin,eslintFixPlugin}  = require('ts-migrate-plugins')
const { migrate, MigrateConfig } = require('ts-migrate-server')
const { convertJsToTs } = require('js-to-ts-converter');
const fs = require('fs');
const { reject } = require('lodash');

const inputDir = process.cwd();

console.log(inputDir);
const config = new MigrateConfig().addPlugin(jsDocPlugin, {})
                        .addPlugin(declareMissingClassPropertiesPlugin,{})
                        .addPlugin(addConversionsPlugin, {})
                        .addPlugin(eslintFixPlugin,{});

createTsConfigFile(inputDir).then((checkFile) => {
    console.log('in ts',checkFile);
    if(!checkFile) {
        console.log('No file created, Please create tsConfig file Manually');
        return;
    } else {
        console.log('comes here')
        migrate({ rootDir: inputDir, config}).then((code) => {
            console.log('--> Ts-migrate runs successfully on your directory')
            convertJsToTs(inputDir).then(() => {
                console.log('--> js-to-ts-converter runs successfully on your directory')
                deleteTsConfigFile(inputDir);
                process.exit(code);
            }).catch(err => { 
                console.log(err)
                process.exit(1)
            })
        }).catch((err) => {
            console.log(err)
            process.exit(1)
        });
    }
});
const tsConfigs = {
    "compilerOptions": {
    "allowJs": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "jsx": "preserve",
    "lib": [
    "dom",
    "esnext"
    ],
    "module": "commonjs",
    "moduleResolution": "node",
    "noEmit": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "resolveJsonModule": true,
    "skipLibCheck": true,
    "sourceMap": true,
    "strict": true,
    "target": "esnext",
    "importHelpers": true,
    "preserveSymlinks": true,
    "noImplicitAny": false
    }
}

function createTsConfigFile(inputDir) {
    return new Promise((resolve, reject) => {
        fs.open(inputDir+'/tsconfig.json', (err,desc) => {
            if(err && err.code  === 'ENOENT'){
               return resolve(writeFile(inputDir))
            }
            return resolve(false);
        })
    })
}

function writeFile(){
    return new Promise((resolve, reject) => {
        fs.writeFile(inputDir+'/tsconfig.json',JSON.stringify(tsConfigs,null,2), (err, desc) => {
            if(err){
                console.log("Not able to Create tsconfig file please create Manually with config",tsConfigs)
                return resolve(false);
            }
            console.log("Successfully Created tsconfig file");
            return resolve(true);
        })
    })
}


function deleteTsConfigFile(inputDir) {
    console.log('deleting tsconfile file');
    return new Promise((resolve, reject) => {
        resolve(fs.unlinkSync(inputDir+'/tsconfig.json'));
    })
}