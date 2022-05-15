export class Drawing {
    constructor(id: string, name: string, tags: string[], link: string) {
        this.id = id;
        this.name = name;
        this.tags = tags;
        this.link = link;
    }
    id: string;
    name: string;
    tags: string[];
    link: string;
}
