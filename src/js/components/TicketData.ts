import { PageDefinition } from "../models/data/Page";
import Component from "./Component";

export default class TicketData extends Component {

    public constructor() {
        super({
            constraint: PageDefinition.tickets.view,
            waitForDOM: "form.edit_ticket",
        });
    }

    protected create(): Promise<void> {



        return;
    }

}
