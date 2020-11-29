/*
 * Requires:
 *     psiturk.js
 *     utils.js
 */

// Initalize psiturk object
var psiTurk = new PsiTurk(uniqueId, adServerLoc, mode);

// Task object to keep track of the current phase
var currentview;

var mycondition = condition;  // these two variables are passed by the psiturk server process
var mycounterbalance = counterbalance;  // they tell you which condition you have been assigned to

/******************************************
 * You will need to update the below code *
 *****************************************/

// All pages to be loaded
var pages = [
    "instruct-1.html",        // instructions
    "demographics.html",      // demographic information
    "check_video.html",       // checks the users audio and video
    "intro_video.html",       // first of our videos
    "pretest.html",           // asking questions
    "command_video.html",     // more videos
    "response_video.html",    //
    "questions.html",         // more questions
    "final_question.html",    //
    "check_question.html"     // attention check question
];

psiTurk.preloadPages(pages);

var instructionPages = [ // add as a list as many pages as you like
    "instruct-1.html"
];

// These variables are prefixes to the paths of the videos we want to show,
// which change depending on the condition we are randomly assigned.
var command_vid = ""
var prefix = "/static/videos"
var video_conditions = [
  "passive",
  "aggressive",
];

/*
This example experiment has 2 conditions:
1 will be aggressive
2 will be passive
*/


// Below is the between-subjects portion of the experiment.
// Each condition is assigned a (action,response) pair.
if (mycondition > 0) {
    command_vid = "/static/videos/passive"
}
else {
    command_vid = "/static/videos/aggressive"
}

var question_label = command_vid;
/********************
 * HTML manipulation
 *
 * All HTML files in the templates directory are requested
 * from the server when the PsiTurk object is created above. We
 * need code to get those pages from the PsiTurk object and
 * insert them into the document.
 *
 ********************/


/*****************************
 * Demographic Questionnaire *
 *****************************/
// You will likely leave this unchanged.
var DemoQuestionnaire = function() {

    psiTurk.finishInstructions();

    var error_message = "<h1>Oops!</h1><p>Something went wrong submitting your information. This might happen if you lose your internet connection. Press the button to resubmit.</p><button id='resubmit'>Resubmit</button>";

    record_responses = function() {

        psiTurk.recordUnstructuredData("condition",mycondition);
   //alert(mycondition);

   psiTurk.recordTrialData({'phase':'demoquestionnaire', 'status':'submit'});

   $('input[name=age]').each( function(i, val) {
       psiTurk.recordUnstructuredData(this.id, this.value);
   });

   var radio_groups = {}
   $(":radio").each(function(i, val){
       radio_groups[this.name] = true;
   })

       for(group in radio_groups){
           psiTurk.recordUnstructuredData(group,$(":radio[name='"+group+"']:checked").val());
       }

    };

    prompt_resubmit = function() {
   replaceBody(error_message);
   $("#resubmit").click(resubmit);
    };

    resubmit = function() {
   replaceBody("<h1>Trying to resubmit...</h1>");
   reprompt = setTimeout(prompt_resubmit, 10000);

   psiTurk.saveData({
       success: function() {
      clearInterval(reprompt);

       },
       error: prompt_resubmit
   });
    };

    // Load the questionnaire snippet
    psiTurk.showPage('demographics.html');
    window.scrollTo(0, 0);
    psiTurk.recordTrialData({'phase':'demoquestionnaire', 'status':'begin'});

    var r1, r2 = false;

    (function() {
   var empty = true;
   $('#age').keyup(function() {

            empty = false;
            $('#age').each(function() {
      if ($(this).val() == '' || $(this).val() < 18 || $(this).val() > 110) {
                    empty = true;
      }
            });

            if (empty) {
       r1 = false;
       checkenable();
            } else {
      r1 = true;
      checkenable();
            }
   });
    })()

    $("input[name=gender]").change(function(){
   r2=true;
   checkenable();
    });

    function checkenable(){
   if (r1 && r2){
       $('#next').removeAttr('disabled');
   }
   else {
       $('#next').prop('disabled', true);
   }
    }

    $("#next").click(function () {
       record_responses();

   psiTurk.saveData({
       success: function() {
      clearInterval(reprompt);

       },
       error: prompt_resubmit
   });

   currentview = new VidCheck();
    });
};


/***************
 * Video Check *
 ***************/
// You will likely leave this unchanged.
var VidCheck = function() {

    var error_message = "<h1>Oops!</h1><p>Something went wrong submitting your information. This might happen if you lose your internet connection. Press the button to resubmit.</p><button id='resubmit'>Resubmit</button>";

    var ppcounter = 0;
    var rscounter = 0;

    record_responses = function() {
        psiTurk.recordTrialData({'phase':'vidcheck', 'status':'submit'});
        //alert($("my_text").value());
    };

    prompt_resubmit = function() {
        replaceBody(error_message);
        $("#resubmit").click(resubmit);
    };

    resubmit = function() {
        replaceBody("<h1>Trying to resubmit...</h1>");
        reprompt = setTimeout(prompt_resubmit, 10000);
        psiTurk.saveData({
            success: function() {
                clearInterval(reprompt);
            },
            error: prompt_resubmit
        });
    };

    // Load the questionnaire snippet
    psiTurk.showPage('check_video.html');
    window.scrollTo(0, 0);
    psiTurk.recordTrialData({'phase':'vidcheck', 'status':'begin'});

    var r1, r2, r3 = false;

    function checkenable(){
        if (r1 && r2 && r3){
            $('#next').removeAttr('disabled');
        }
        else {
            $('#next').prop('disabled', true);
        }
    }

    $("input[name=seeword]").keyup(function(){
        var word = $("input[name=seeword]").val();
        word = word.toLowerCase();
        r1 = false;
        if (word.includes("amazing")) {
            r1=true;
        }
        checkenable();
    });

    $("input[name=hearword]").keyup(function(){
        var word = $("input[name=hearword]").val();
        word = word.toLowerCase();
        r2 = false;
        if (word.includes("forest")) {
            r2 = true;
        }
        checkenable();
    });

    $("#video1").on('ended', function() {
        psiTurk.recordTrialData({'phase':'vidcheck', 'status':'video ended'});
        r3 = true;
        checkenable();
    });

    $("#ppbutton").click(function () {
        psiTurk.recordTrialData({'phase':'vidcheck', 'status':'play/pause clicked: '+ppcounter});
        ppcounter += 1;
    });

    $("#rsbutton").click(function () {
        psiTurk.recordTrialData({'phase':'vidcheck', 'status':'restart clicked: '+rscounter});
        rscounter += 1;
    });

    $("#next").click(function () {
        record_responses();
        currentview = new CommandVideo();
    });
};


/*****************
 * Command Video *
 ****************/
// This is the video in which the human issues their command
// No questions are asked, and no input is required from the user
var CommandVideo = function() {

    var error_message = "<h1>Oops!</h1><p>Something went wrong submitting your information. This might happen if you lose your internet connection. Press the button to resubmit.</p><button id='resubmit'>Resubmit</button>";

    var ppcounter = 0;
    var rscounter = 0;

    record_responses = function() {
        psiTurk.recordTrialData({'phase':'command_video', 'status':'submit'});
    };

    prompt_resubmit = function() {
        replaceBody(error_message);
        $("#resubmit").click(resubmit);
    };

    resubmit = function() {
        replaceBody("<h1>Trying to resubmit...</h1>");
        reprompt = setTimeout(prompt_resubmit, 10000);
        psiTurk.saveData({
            success: function() {
                clearInterval(reprompt);
            },
            error: prompt_resubmit
        });
    };

    psiTurk.showPage('command_video.html');
    window.scrollTo(0, 0);
    psiTurk.recordTrialData({'phase':'command_video', 'status':'begin'});


    $("#mp4src").attr("src", command_vid+".mp4")
    $("#oggsrc").attr("src", command_vid+".ogg")

    $("#video2").load();


    $("#video2").on('ended', function() {
        psiTurk.recordTrialData({'phase':'command_video', 'status':'video ended'});
        $('#next').removeAttr('disabled');
    });

    $("#ppbutton").click(function () {
        psiTurk.recordTrialData({'phase':'command_video', 'status':'play/pause clicked: '+ppcounter});
        ppcounter += 1;
    });

    $("#rsbutton").click(function () {
        psiTurk.recordTrialData({'phase':'command_video', 'status':'restart clicked: '+rscounter});
        rscounter += 1;
    });

    $("#next").click(function () {
        record_responses();
        currentview = new Questions();
    });
};

/**************
 * Questions  *
 **************/
// This asks the user some questions about the videos they just watched.
var Questions = function() {

    var error_message = "<h1>Oops!</h1><p>Something went wrong submitting your information. This might happen if you lose your internet connection. Press the button to resubmit.</p><button id='resubmit'>Resubmit</button>";

    // Note that the phase is updated to reflect the new within-subjects assignment.
    record_responses = function() {
        psiTurk.recordTrialData({'phase':'questions_'+command_vid, 'status':'submit'});
        for(i=1; i<=5; i++){
            psiTurk.recordUnstructuredData(question_label +"_"+i,$("input[name='"+i+"']").val());
        }
    };

    prompt_resubmit = function() {
   replaceBody(error_message);
   $("#resubmit").click(resubmit);
    };

    resubmit = function() {
   replaceBody("<h1>Trying to resubmit...</h1>");
   reprompt = setTimeout(prompt_resubmit, 10000);

   psiTurk.saveData({
       success: function() {
      clearInterval(reprompt);

       },
       error: prompt_resubmit
   });
    };

    // Load the questionnaire snippet
    psiTurk.showPage('questions.html');
    window.scrollTo(0, 0);
    psiTurk.recordTrialData({'phase':'questions', 'status':'begin'});
    //alert("mycondition... "+mycondition+ " = 0? "+(mycondition==0));

    function checkenable(){
        allclicked=true;
        $(".not-clicked").each(function(i, val){
            allclicked=false;
        });
        if(allclicked){
        $('#next').removeAttr('disabled');
        }
    }

    $(".not-clicked").click(function(e){
        $(this).removeClass('not-clicked');
        $(this).addClass('clicked');
        checkenable();
    });

    $("#next").click(function () {
        record_responses();
        question_label = command_vid;
        currentview = new CheckQuestion();
    });

};

/******************
 * Check Question *
 ******************/
// This question ensures that people are paying attention and are not bots
// Incorrect answers to this question mean we can disregard their submission
var CheckQuestion = function() {

    psiTurk.finishInstructions();

    var error_message = "<h1>Oops!</h1><p>Something went wrong submitting your information. This might happen if you lose your internet connection. Press the button to resubmit.</p><button id='resubmit'>Resubmit</button>";

    record_responses = function() {

   psiTurk.recordTrialData({'phase':'checkquestion', 'status':'submit'});

   var radio_groups = {}
   $(":radio").each(function(i, val){
       radio_groups[this.name] = true;
   })

       for(group in radio_groups){
           psiTurk.recordUnstructuredData(group,$(":radio[name='"+group+"']:checked").val());
       }

    };

    prompt_resubmit = function() {
   replaceBody(error_message);
   $("#resubmit").click(resubmit);
    };

    resubmit = function() {
   replaceBody("<h1>Trying to resubmit...</h1>");
   reprompt = setTimeout(prompt_resubmit, 10000);

   psiTurk.saveData({
       success: function() {
      clearInterval(reprompt);

       },
       error: prompt_resubmit
   });
    };

    // Load the questionnaire snippet
    psiTurk.showPage('check_question.html');
    window.scrollTo(0, 0);
    psiTurk.recordTrialData({'phase':'checkquestion', 'status':'begin'});

    $("input[name=check]").change(function(){
   $('#next').removeAttr('disabled');
    });


    $("#next").click(function () {
       record_responses();
   psiTurk.saveData({
            success: function(){
                psiTurk.computeBonus('compute_bonus', function() {
                    psiTurk.completeHIT(); // when finished saving compute bonus, the quit
                });
            },
            error: prompt_resubmit});
    });
};

/*******************
 * Run Task
 ******************/
 // You will likely leave this unchanged.
$(window).load( function(){
    psiTurk.doInstructions(
       instructionPages, // a list of pages you want to display in sequence
       function() { currentview = new DemoQuestionnaire(); } // what you want to do when you are done with instructions
    );
});
