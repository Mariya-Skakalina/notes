class CreateDomElement{
    constructor(options){
        let res = [];
        if (Array.isArray(options) === true){
            for (let element of options){
                res.push(this.create(element));
            }
        } else {
            res = this.create(options);
        }
        return res;
    }
    create(element){
        let newElement = document.createElement(element.nameTag);
        if(element.idTag !== undefined){
            newElement.id = element.idTag;
        }
        if(element.classTag !==undefined){
            newElement.classList.add(element.classTag);
        }
        if(element.attributeTag !== undefined){
            for (let j of element.attributeTag){
                newElement.setAttribute(j[0], j[1]);
            }
        }
        if(element.parentElement !== undefined){
            if (element.parentElement[0] === "-"){
                element.parentElement = element.parentElement.slice(1)
                let nodes = document.getElementById(element.parentElement)
                if (nodes.children !== null){
                    nodes.insertBefore(newElement,nodes.children[0]);
                } else {
                    document.getElementById(element.parentElement).appendChild(newElement);
                }
            } else {
                document.getElementById(element.parentElement).appendChild(newElement);
            }
        }else{
            document.body.appendChild(newElement);
        }
        
        if(element.text !== undefined){
            newElement.textContent = element.text;
        }
        return newElement
    }
}
// 

class DeleteElement{
    constructor(tagId){
        this.tagId = document.getElementById(tagId);
        this.deleteChild();
        return this.tagId;
    }
    deleteChild(){
        while(this.tagId.firstChild){
            this.tagId.removeChild(this.tagId.firstChild);
        }
    }
}

export {DeleteElement,CreateDomElement}