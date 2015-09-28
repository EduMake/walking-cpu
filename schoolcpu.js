
    var Random = require( 'rng' );    
    var clone = require('clone');
    var util = require('util');
    var Handlebars = require("handlebars");
    var fs = require('fs');
    var phantom = require('phantom');
    
    var aInstructionNames = ["A", "B", "C", "D", "E", "F", "2", "3"];
    
    var aRoomGroups = [
        ["Reception", "CAD/CAM 1"], 
        ["Prototyping", "Art"],
        ["Studio 3", "German"], 
        ["Dirty Design", "MPS"],
        ["Science Prep Room", "Learning Base 1"],
        ["Learning Base 4", "Studio 1"],
        ["Multi Media 1", "Studio 2"],
        ["Studio 4", "CAD/CAM 2"]
    ];
    
    var aPosters = [];
    for(var i = 0; i<aInstructionNames.length; i++) {
        for(var j = 0; j<aRoomGroups[i].length; j++) {
            aPosters.push({
                "data":aInstructionNames[i],
                "name":aRoomGroups[i][j]
            });
        }
    }
      
    
    console.log("aPosters =", aPosters);
    
    page = fs.readFileSync("templates/Posters.handlebars", "utf8");
    //console.log("page =", page);
    var oPostersTemplate = Handlebars.compile(page);
    html = oPostersTemplate({"aPosters":aPosters});
    //console.log("html =", html);
        
    fs.writeFile('output/posters.html', html, function (err) {
      if (err){ return console.log(err);}
      console.log('html > posters.html');
    });

    phantom.create(function (ph) {                                                          
        //console.log("creating phantom for "+sPersonID);
        ph.createPage(function (page) {
          //console.log("creating page for "+sPersonID);
          page.set('paperSize', {
            format: 'A4'
          }, function() {
            // continue with page setup
            page.open("output/posters.html", function (status) {
              page.render("output/posters.pdf", function(){
                console.log("Posters sheets rendered ", status);
                ph.exit();
              });
            });
          });
        });
    });

    //process.exit()
    
    var aNumbers = [6,6,5,1];
    var sClass = "Y11 Options";
    var iClass = sClass.split("").reduce(function(previousValue, currentValue, index, array) {
        return index + previousValue + currentValue.charCodeAt(0);
        //console.log("currentValue =", currentValue);
    },0);
    var mt = new Random.MT( iClass );
            
    //process.exit();
    
    // TODO : Refactor Instuction Set into Levels
    // TODO : Add sorting on hardeness of the actuall maths (possibly by size of final figure)
    // TODO : limit the numer per level replacing the 500 / 1000
    // TODO : Node /jquery style options
    // TODO : Add config for the instruction sets
    // TODO : Add config for the room names
    // TODO : Add level selector config
    // TODO : add package.json
    // TODO : commit to github repo
    // TODO : Change variable names to Program, instruction set .....
    // TODO : Findway to render to tablet / phone interface
    
    var aLevels = [
        {
            sLevelName:"The Basic Idea",
            sGrade:"C",
            gradeA: false,
            gradeB: false,
            gradeC: true,
            iMaxNumber:100,
            sStartType:"both",
            sTemplate:"operation1col",
            fetch:"Go to the next classroom (RAM address) in 'Your Program' & read the data on the door.",
            decode:"Look up what the data on the door (OP Code) means in the 'Instruction Set'",
            execute:"Do the mathematical operation to your current number. Only write the answer in the table.",
            aInstructions:[
                {"operation":"+", "operand":1},
                {"operation":"-", "operand":2},
                {"operation":"x", "operand":3},
                {"operation":"/", "operand":2},
                {"operation":"+", "operand":4},
                {"operation":"-", "operand":3}
            ]
        },
        {
            sLevelName:"The Idea",
            sGrade:"B",
            gradeA: false,
            gradeB: true,
            gradeC: true,
            iMaxNumber:200,
            sStartType:"operation",
            sTemplate:"operation1col",
            fetch:"Go to the next classroom (RAM address) in 'Your Program' & read the data on the door",
            decode:"Look up what the data on the door means in the 'Instruction Set' either it is an OP Code for a maths Operation or a number.",
            execute:"If you have decoded an operation keep it until you decode a number then perform that calculation. Only write the answer in the table.",
            aInstructions:[
                {"operation":"+", "operand":null},
                {"operation":"-", "operand":null},
                {"operation":"x", "operand":null},
                {"operation":"/", "operand":null},
                {"operation":null, "operand":14},
                {"operation":null, "operand":15},
                {"operation":null, "operand":2},
                {"operation":null, "operand":3}
            ]
        },
        {
            sLevelName:"Von Neuman",
            sGrade:"A",
            gradeA: true,
            gradeB: true,
            gradeC: true,
            iMaxNumber:500,
            sStartType:"operation",
            sTemplate:"operation2col",
            fetch:"Go to the next classroom (RAM address) in 'Your Program' & read the data on the door",
            decode:"Look up what the data on the door means in the 'Instruction Set' either an OP Code for a maths Operation or an Operand (number), depending what you expect next. Start with an operation.",
            execute:"If you have decoded an operation keep it until you decode an Operand (number) then perform that calculation. Only write the answer in the table.",
            aInstructions:[
                {"operation":"+", "operand":10},
                {"operation":"-", "operand":11},
                {"operation":"x", "operand":12},
                {"operation":"/", "operand":13},
                {"operation":"INC", "operand":14},
                {"operation":"DEC", "operand":15},
                {"operation":null, "operand":2},
                {"operation":null, "operand":3}
            ]
        },
    
        {
            sLevelName:"Proper CPU",
            sGrade:"A*",
            gradeA: true,
            gradeB: true,
            gradeC: true,
            iMaxNumber:1000,
            sStartType:"operation",
            sTemplate:"operation2col",
            fetch:"Go to the next classroom (RAM address) in 'Your Program' & read the data on the door",
            decode:"Look up what the data on the door means in the 'Instruction Set' either an OP Code for an Operation or a number (Operand), depending what you expect next. Start with an operation.",
            execute:"If you have decoded an operation that needs an Operand (number) keep it until you decode an Operand (number) then perform that calculation. Only write the answer in the table.",
            aInstructions:[
                {"operation":"+", "operand":10},
                {"operation":"-", "operand":11},
                {"operation":"x", "operand":12},
                {"operation":"/", "operand":13},
                {"operation":"INC", "operand":14},
                {"operation":"DEC", "operand":15},
                {"operation":null, "operand":2},
                {"operation":null, "operand":3}/*
                {"operation":"INC", "operand":14},
                {"operation":"jmp", "operand":15}*/
            ]
        }
    ];
    
    /* TODO : before we start could we take the roomnames data labels and 
    instructions and join them together and use that instead of aInstructions*/
    
    var Worksheet = {
        iInstructionSet: 0,
        iSheetNumber: 1,
        iSteps:6,
        iPosition:1,
        aResults:[],
        aRandomNumbers:[],
        sCurrentOperation:"",
        sStartType:"both",
        aAvailableInstructions:[],
        oLevel:{},
        aValidList:[],
        aChosen:[],
        init: function init(iSheetNumber, iInstructionSet) {
            this.iInstructionSet = iInstructionSet;
            
            this.oLevel = clone(aLevels[this.iInstructionSet]);
            var aRoomsGrouped = clone(aRoomGroups);
            
            
            aRoomsGrouped = aRoomsGrouped.map(function(aRs){
                return aRs.sort(function(a,b){
                    return (Math.round(mt.next()) % 3) - 1 ;
                });
            });
            
            this.aAvailableInstructions = this.oLevel.aInstructions.map(function(item,key){
                    item.iAddress = key;
                    
                    item.aRoomNames = aRoomsGrouped[key];
                    item.iUsed = 0;
                    item.sData = aInstructionNames[key];
                    return item;
            });
            
            
            this.sStartType = this.oLevel.sStartType;
            
            for( var i = 0; i <= this.iSteps; i++ )
            {
                this.aRandomNumbers[i] = mt.next();
                
            }
            this.iSheetNumber = iSheetNumber;
            this.aResults[0] = this.iSheetNumber;
        },
        
        getChosen:function()
        {
            var aFinalList = [];
            if(this.aValid.length) {
              //console.log("this.aValid =", this.aValid);
              aFinalList = this.getLevel(this.aValid, 1, aFinalList);
            
              this.aChosen = aFinalList; 
            }
            return aFinalList;
        },
        
        getLevel:function(aList, iLevel, aSelected)
        {
            // TODO : hreuristic to choose best
            // TODO : or just filter the ones with duplicates out
            
            var iRandom = this.aRandomNumbers[iLevel];
            var iListLength = aList.length;
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
        
        createValidList:function() 
        {
            this.aValid = this.genValidList(1, this.sStartType, this.iSheetNumber, "", 0, 0); 
            return this.aValid;
        },   
        
        genValidList:function(iStep, sType, iCurrVal, sCurrentOperation, iStepsMapped, iLastAddress) 
        {
            var aInstructionSet = this.aAvailableInstructions;
            
            var aValidList = aInstructionSet.filter(function(aInstruction){
                if (aInstruction.iAddress === iLastAddress)
                { 
                    return false;
                }
                    
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
            
            var aProcessed = aValidList.map(function(line){
                    
                var iResult = iCurrVal; 
                var iNextStep = iStep + 1;
                var sNextType = ((sType === "both")?"both":(sType === "operation")?"operand":"operation");
                
                var aNewLine = clone(line);
                aNewLine.sRoomName = aNewLine.aRoomNames[iResult % aNewLine.aRoomNames.length];
            
                // TODO : could try putting the score tracking in here
                    
                aNewLine.sCurrentOperation = sCurrentOperation;
                aNewLine.bListOperation = true;
                aNewLine.bListOperand   = true;
                if(sType === "operation")
                {
                    aNewLine.bListOperand = false;
                } else {
                    aNewLine.bListOperation = false;
                }
                
                if(sType === "operation")
                {
                    aNewLine.sCurrentOperation = line.operation;
                    
                    iResult = iCurrVal;
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
                    
                    //console.log("aNewLine =", aNewLine);
                    
                    return aNewLine;
                }
                
                if(sType === "both")
                {
                    aNewLine.sCurrentOperation = aNewLine.operation;
                    aNewLine.sDisplay = aNewLine.operation+aNewLine.operand;
                }
                else
                {
                    aNewLine.sDisplay = aNewLine.operand;
                }
                
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
                    case "jmp":
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
                if (val.iResult > 1000) {
                    return false;
                }
                
                if(val.iNextStep >= this.iSteps)
                { 
                    return false;
                }
                
                return true;
            });
            
            
            
            if(iStepsMapped < this.iSteps &&  iStep < this.iSteps )
            {
                var aListChildren = aIntList.map(function(aLine, ind, cur){
                    var aLineWChild = clone(aLine);
                    aLineWChild.aChildren = this.genValidList(aLine.iNextStep, aLine.sNextType, aLine.iResult, aLine.sCurrentOperation, iStepsMapped +1, aLine.iAddress); 
                    return aLineWChild;
                }, this);
               
                var aListChildrenTrimmed = aListChildren.filter(function(aChildLine, ind, cur){
                    return aChildLine.aChildren.length > 0;
                });
                // TODO  Trim back empty branches
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
            
        for(var j = 0; j < aNumbers[iCurrLevel]; j++)
        {
            var oWorksheet = Object.create(Worksheet);
            oWorksheet.init(j+1, iCurrLevel);
            var aValid = oWorksheet.createValidList();
            //console.log("aValid =", aValid);
            var aChosen = oWorksheet.getChosen();
            aWorksheets.push(oWorksheet);
        }
    }
    
    
    var page = fs.readFileSync("templates/teachers.handlebars", "utf8");
    var oTeachersTemplate = Handlebars.compile(page);
    var html = oTeachersTemplate({"aWorksheets":aWorksheets});
        
    fs.writeFile('output/teachers.html', html, function (err) {
      if (err){ return console.log(err);}
      console.log('html > teachers.html');
    });

    page = fs.readFileSync("templates/worksheets.handlebars", "utf8");
    var oWorksheetsTemplate = Handlebars.compile(page);
    html = oWorksheetsTemplate({"aWorksheets":aWorksheets});
        
    fs.writeFile('output/worksheets.html', html, function (err) {
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
            page.open("output/teachers.html", function (status) {
              page.render("output/teachers.pdf", function(){
                console.log("Teachers sheets rendered ", status);
                  
                page.open("output/worksheets.html", function (status) {
                  page.render("output/worksheets.pdf", function(){
                    console.log("Worksheets sheets rendered ", status);
                    ph.exit();
                  });
                });
              });
            });
          });
        });
    });

    
    
