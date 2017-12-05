Ok, just using this to collect my thoughts...

So what I want to make here is a way to maneuver through the GTD methodology(or at least my take on it) using a command line interface


So first things first. using vorpal, we have an inbox mode called in. When in inbox mode you process tasks, just likek typical gtd methodolgy. So why not just Have it choose the very first task by default and then give you your options.

So let's go with a fully guided walktrhough mode to start with...

So in inbox mode you are presented with the task information, and are asked, Is this task actionable?

  NO
    If the task is not actionable you are asked to either delete it, incubate it, reference it(journal ideas, recipes etc.)
    DELETE
        Call a delete action
    INCUBATE
        This one is a bit tricker. For now I'm going to just append it to a someday notes file...
    REFERENCE
        Same with this one. I think it essentially deletes it after you yourself add it to a reference library. So maybe I just don't even ask it... \No, make it a reminder
  YES
    Now most diagrams don't show this next part as a separate question, but I like it for a guided mode. Ask the user if the task requires more than 1 action.
    YES
      Then create a project. In our case, we will ask what the name of the project should be(might even want to sanitize the input here as well) and then ask what the first step should be. This could all be done in a project entry mode actually, and just tell the user to type exit when finished. 
    NO
      Then ask <2 mins
        YES
	  Prompt user to activate the task and exit, or cancel
	NO
	  Defer or Delegate?
	    DEFER
	      Later, next, scheduled
	        LATER
		  Add the later tag(but then how does it get back in our queue????
		NEXT
		  Add the next tag(but again, what if other items we defer all have nexts????
		SCHEDULED
		  This makes some sense, but still a little iffy. We'll get user input on the due date and modify the task with that value




Inbox mode? 
So I'm not sure this needs to be a vorpal mode. This feels more like a simple command as we should just pass through each item one at a time and then exit inbox mode. Gonna try it that way to start. Can make it a mode later if need be.

