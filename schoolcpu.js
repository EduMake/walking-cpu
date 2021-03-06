    var Random = require( 'rng' );    
    var clone = require('clone');
    var util = require('util');
    var Handlebars = require("handlebars");
    var fs = require('fs');
    var phantom = require('phantom');
    var arrayShuffle = require("array-shuffle");
    var ArgumentParser = require('argparse').ArgumentParser;

    var parser = new ArgumentParser({
      version: '0.0.1',
      addHelp:true,
      description: 'Educational exercise about the Fetch->Decode->Execute cycle'
    });
    
    parser.addArgument(
      [ '-n', '--numbers' ],
      {
        help: "How many of each level C,B,A,A*",
        defaultValue: "2,2,2,2",
        dest:"numbers"
      }
    );
    
    parser.addArgument(
      [ '-o', '--output' ],
      {
        help: "Output directory.",
        defaultValue: "output",
        dest:"outputdir"
      }
    );
    
    parser.addArgument(
      [ '-g', '--group' ],
      {
        help: "Group Name",
        defaultValue: "default",
        dest:"groupname"
      }
    );
    
    parser.addArgument(
      [ '-l', '--levels' ],
      {
        help: "Level Config Name",
        defaultValue: "default",
        dest:"levelconfig"
      }
    );
    
    parser.addArgument(
      [ '-r', '--rooms' ],
      {
        help: "Rooms Config Name",
        defaultValue: "default",
        dest:"roomconfig"
      }
    );
    
    var options = parser.parseArgs();
    console.log("options =", options);

    if(!fs.existsSync(options.outputdir)) {
      fs.mkdirSync(options.outputdir);
    }
    
    var aInstructionNames = ["A", "B", "C", "D", "E", "F", "2", "3"];
    
    var aRoomGroups = JSON.parse(fs.readFileSync("roomconfig/"+options.roomconfig+".json").toString());
    
    var aNumbers = options.numbers.split(",");//[6,6,5,3];
    //TODO : make A* hard rather than possibly hard
    var sClass = options.groupname;//"Y11 Option";
    
    var aPosters = [];
    for(var i = 0; i<aInstructionNames.length; i++) {
        for(var j = 0; j<aRoomGroups[i].length; j++) {
            aPosters.push({
                "data":aInstructionNames[i],
                "name":aRoomGroups[i][j]
            });
        }
    }
    
    page = fs.readFileSync("templates/Posters.handlebars", "utf8");
    var oPostersTemplate = Handlebars.compile(page);
    html = oPostersTemplate({"aPosters":aPosters});
        
    fs.writeFile(options.outputdir+"/posters.html", html, function (err) {
      if (err){ return console.log(err);}
      console.log('html > posters.html');
    });

    phantom.create(function (ph) {                                                          
        ph.createPage(function (page) {
          page.set('paperSize', {
            format: 'A4'
          }, function() {
            page.open(options.outputdir+"/posters.html", function (status) {
              page.render(options.outputdir+"/posters.pdf", function(){
                console.log("Posters sheets rendered ", status);
                ph.exit();
              });
            });
          });
        });
    });

    //process.exit()
    var iClass = sClass.split("").reduce(function(previousValue, currentValue, index, array) {
        return index + previousValue + currentValue.charCodeAt(0);
    },0);
    var mt = new Random.MT( iClass );
                
    // TODO : Refactor Instuction Set into Levels
    // TODO : Add sorting on hardeness of the actuall maths (possibly by size of final figure)
    // TODO : limit the numer per level replacing the 500 / 1000
    // TODO : Node /jquery style options
    // TODO : Change variable names to Program, instruction set .....
    // TODO : Findway to render to tablet / phone interface
    
    var aLevels = JSON.parse(fs.readFileSync("levelconfig/"+options.levelconfig+".json").toString());
    
    //Map the Room names, Data entries and the instructions avaiable to each level togther
    var aLevels = aLevels.map(function(oLevel, iKey){
        oLevel.aRoomInstructions = [];
        
        for(var i = 0; i<oLevel.aInstructions.length; i++) {
            if(typeof oLevel.aInstructions[i].limit === "undefined") {
              oLevel.aInstructions[i].limit = aRoomGroups[i].length;
            }
            for(var j = 0; j<oLevel.aInstructions[i].limit; j++) {
                var oRoomInstructions = clone(oLevel.aInstructions[i]);
                //console.log("oRoomInstructions =", oRoomInstructions);
                oRoomInstructions.sData = aInstructionNames[i];
                oRoomInstructions.sRoomName = aRoomGroups[i][j];
                oLevel.aRoomInstructions.push(oRoomInstructions);
            }
        }
        
        //oLevel.aRoomInstructions = arrayShuffle(oLevel.aRoomInstructions);
        //console.log("oLevel.aRoomInstructions =", oLevel.aRoomInstructions);
        return oLevel;
    });
    
    
    var Worksheet = {
        sGroupName:"",
        iInstructionSet: 0,
        iSheetNumber: 1,
        iSteps:6,
        iPosition:1,
        aResults:[],
        aRandomNumbers:[],
        sCurrentOperation:"",
        sStartType:"both",
        aInstructions:[],
        aAvailableInstructions:[],
        oLevel:{},
        aValidList:[],
        aChosen:[],
        init: function init(iSheetNumber, iInstructionSet, sGroupName) {
            this.sGroupName = sGroupName;
            this.iInstructionSet = iInstructionSet;
            
            this.oLevel = clone(aLevels[this.iInstructionSet]);
            
            this.aAvailableInstructions = clone(this.oLevel.aRoomInstructions);
            this.aInstructions = clone(this.oLevel.aInstructions);
            for(var i = 0; i<this.aInstructions.length; i++) {
              this.aInstructions[i].sData = aInstructionNames[i];
            }
            
            this.sStartType = this.oLevel.sStartType;
            
            for( var i = 0; i <= this.iSteps; i++ )
            {
                this.aRandomNumbers[i] = mt.next();
                
            }
            this.iSheetNumber = iSheetNumber;
            this.aResults[0] = this.iSheetNumber;
        },
        
        getChosen:function() {
            var aFinalList = [];
            if(this.aValid.length) {
              aFinalList = this.getLevel(this.aValid, 1, aFinalList);
              this.aChosen = aFinalList; 
            } else {
                console.log("No Valids to be chosen");
            }
            return aFinalList;
        },
        
        getLevel:function(aList, iLevel, aSelected) {
            // TODO : hreuristic to choose best
            // TODO : or just filter the ones with duplicates out
            
            var iRandom = this.aRandomNumbers[iLevel];
            var iListLength = aList.length;
            //var iChosen =  iRandom % iListLength;
            var iChosen =  iRandom % iListLength;
            
            var oChosen = clone(aList[iChosen]);
            oChosen.aChildren = false;
            aSelected.push(oChosen);
            
            if(aList[iChosen].aChildren.length>0)
            {
                aSelected = this.getLevel(aList[iChosen].aChildren, iLevel+1, aSelected);
            }
            return aSelected;
        },
        
        createValidList:function() {
            this.aValid = this.genValidList(1, this.sStartType, this.iSheetNumber, "", 0, "", this.aAvailableInstructions); 
            return this.aValid;
        },   
        
        //the guts stips out invalid options
        genValidList:function(iStep, sType, iCurrVal, sCurrentOperation, iStepsMapped, sCurrentRoom, aCurrInstrSet) {
            //console.log("iStep =", iStep); console.log("sType =", sType); console.log("iCurrVal =", iCurrVal);console.log("sCurrentOperation =", sCurrentOperation);           console.log("iStepsMapped =", iStepsMapped);            console.log("sCurrentRoom =", sCurrentRoom);            console.log("aCurrInstrSet =", aCurrInstrSet.length);
            var aNextValid = aCurrInstrSet.filter(function(aInstruction){
                if (aInstruction.sRoomName === sCurrentRoom)
                { 
                    return false;
                }
                return true;
            });
            
            //Filter down to just the room we can work with this time
            var aValidList = aNextValid.filter(function(aInstruction){
                // we want an operand and there isn't one (or if we don't and there is get shot of it)
                if((sType === "operand" ) && (aInstruction.operand === null ))
                {
                    return false;
                }
                if((sType === "operation" ) && (aInstruction.operation === null ))
                {
                    return false;
                }
                return true;
            });
            
            // Do the calculations and operations for the Valid rooms this time
            var aProcessed = aValidList.map(function(line){
                    
                var iResult = iCurrVal; 
                var iNextStep = iStep + 1;
                var sNextType = ((sType === "both")?"both":(sType === "operation")?"operand":"operation");
                
                var aNewLine = clone(line);
            
                // TODO : could try putting the score tracking in here
                    
                aNewLine.sCurrentOperation = sCurrentOperation;
                
                //For display purposes
                aNewLine.bListOperation = true;
                aNewLine.bListOperand   = true;
                if(sType === "operation")
                {
                    aNewLine.bListOperand = false;
                } else {
                    aNewLine.bListOperation = false;
                }
                
                //If the room is an operation
                if(sType === "operation")
                {
                    aNewLine.sCurrentOperation = line.operation;
                    
                    iResult = iCurrVal;
                    //The operations which have np Operand
                    switch(aNewLine.sCurrentOperation)
                    {
                        case "INC":
                            iResult = iCurrVal + 1;
                            sNextType = sType;
                            break;
                        case "DEC":
                            iResult = iCurrVal - 1;
                            sNextType = sType;
                            break;
                        case "NOP":
                            sNextType = sType;
                            break;
                    }
                    
                    
                    aNewLine.iStep = iStep;
                    aNewLine.iCurrVal = iCurrVal;
                    aNewLine.iResult = iResult;
                    aNewLine.iNextStep = iNextStep;
                    aNewLine.sNextType = sNextType;
                    aNewLine.sDisplay = aNewLine.sCurrentOperation;
                    aNewLine.aChildren = [];
                    return aNewLine;
                }
                
                //The C grade ones have Operators and operands
                if(sType === "both")
                {
                    aNewLine.sCurrentOperation = aNewLine.operation;
                    aNewLine.sDisplay = aNewLine.operation+aNewLine.operand;
                }
                else
                {
                    aNewLine.sDisplay = aNewLine.operand;
                }
                
                //The calculations
                switch(aNewLine.sCurrentOperation)
                {
                    case "+":
                        iResult = iCurrVal + aNewLine.operand;
                        break;
                    case "-":
                        iResult = iCurrVal - aNewLine.operand;
                        break;
                    case "x":
                        iResult = iCurrVal * aNewLine.operand;
                        break;
                    case "/":
                        iResult = iCurrVal / aNewLine.operand;
                        break;
                    case "JMP":
                        iNextStep = aNewLine.operand;
                        break;
                }
                
                aNewLine.iStep = iStep;
                aNewLine.iCurrVal = iCurrVal;
                aNewLine.iResult = iResult;
                aNewLine.iNextStep = iNextStep;
                aNewLine.sNextType = sNextType;
                aNewLine.aChildren = [];
                return aNewLine;
            });
            
            //Get rid of things that don't give sane answers 
            var aIntList = aProcessed.filter(function(val, index, org){
                if (Math.round(val.iResult) !== val.iResult)
                {
                    return false;
                }
                
                if (val.iResult <= 0)
                {
                    return false;
                }
                
                // TODO : make this limit part of the level
                //if (val.iResult > this.oLevel.iMaxNumber) {
                if (val.iResult > 500) {
                    return false;
                }
                
                //Would a JMP take us out of the program?
                if(val.iNextStep >= this.iSteps)
                { 
                    return false;
                }
                
                return true;
            });   
            
            aIntList = aIntList.slice(0,5);
            
            //have we stil got steps to work out
            if(iStepsMapped < this.iSteps &&  iStep < this.iSteps )
            {
                var aListChildren = aIntList.map(function(aLine, ind, cur){
                    var aLineWChild = clone(aLine);
                    aLineWChild.aChildren = this.genValidList(aLine.iNextStep, aLine.sNextType, aLine.iResult, aLine.sCurrentOperation, iStepsMapped +1, aLine.sRoomName, aNextValid); 
                    return aLineWChild;
                }, this);
               
                var aListChildrenTrimmed = aListChildren.filter(function(aChildLine, ind, cur){
                    return aChildLine.aChildren.length > 0;
                });
                return aListChildrenTrimmed;
            }
            else
            {
                return aIntList;
            }
        }
    };
    
    var aWorksheets = [];
    for (var iCurrLevel = 0; iCurrLevel < aNumbers.length; iCurrLevel++) {
            
        for(var j = 0; j < aNumbers[iCurrLevel]; j++) {
            var oWorksheet = Object.create(Worksheet);
            oWorksheet.init(j+1, iCurrLevel, options.groupname);
            var aValid = oWorksheet.createValidList();
            //console.log("aValid.length =", aValid.length);
            var aChosen = oWorksheet.getChosen();
            aWorksheets.push(oWorksheet);
            console.log("Worksheet calculation complete", iCurrLevel, j);
        }
    }
    
    var page = fs.readFileSync("templates/teachers.handlebars", "utf8");
    var oTeachersTemplate = Handlebars.compile(page);
    var html = oTeachersTemplate({"aWorksheets":aWorksheets, "sGroupName":options.groupname});
        
    fs.writeFile(options.outputdir+"/teachers.html", html, function (err) {
      if (err){ return console.log(err);}
      console.log('html > teachers.html');
    });

    page = fs.readFileSync("templates/worksheets.handlebars", "utf8");
    var oWorksheetsTemplate = Handlebars.compile(page);
    html = oWorksheetsTemplate({"aWorksheets":aWorksheets});
        
    fs.writeFile(options.outputdir+"/worksheets.html", html, function (err) {
      if (err){ return console.log(err);}
      console.log('html > worksheets.html');
    });

    phantom.create(function (ph) {                                                          
        //console.log("creating phantom for "+sPersonID);
        ph.createPage(function (page) {
          //console.log("creating page for "+sPersonID);
          page.set('paperSize', {
            format: 'A4'
          }, function() {
            // continue with page setup
            page.open(options.outputdir+"/teachers.html", function (status) {
              page.render(options.outputdir+"/teachers.pdf", function(){
                console.log("Teachers sheets rendered ", status);
                  
                page.open(options.outputdir+"/worksheets.html", function (status) {
                  page.render(options.outputdir+"/worksheets.pdf", function(){
                    console.log("Worksheets sheets rendered ", status);
                    ph.exit();
                  });
                });
              });
            });
          });
        });
    });
    
