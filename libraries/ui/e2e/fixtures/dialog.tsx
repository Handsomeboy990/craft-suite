import { Dialog, DialogClose, DialogContent, DialogTrigger } from "../../src";

export function DialogFixture() {
  return (
    <main>
      <h1>Dialog</h1>
      <p>
        <a href="#before">Before the trigger</a>
      </p>
      <Dialog>
        <DialogTrigger>Invite a teammate</DialogTrigger>
        <DialogContent title="Invite a teammate" description="They receive an email with a link.">
          <label>
            Email address <input type="email" name="email" />
          </label>
          <p>
            <DialogClose>Cancel</DialogClose> <button type="button">Send invite</button>
          </p>
        </DialogContent>
      </Dialog>
      <p>
        <a href="#after">After the trigger</a>
      </p>
    </main>
  );
}
