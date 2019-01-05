import {CreateDomElement, DeleteElement} from './component/domelements.js';

class Main {
    constructor(){
        this.inits();
        this.create_dom();
    }
// Отображение заметки
    async view_note(key, position){
        if (position === undefined){
            position = '';
        }
        await new CreateDomElement({nameTag: 'div', classTag: 'note', parentElement: position+'notes', idTag:key._id})
        new CreateDomElement({nameTag: 'p', idTag:'title'+key._id, classTag: 'title', attributeTag:[['title', key.date.toLocaleString('en-GB')]], parentElement: key._id, text: key.title})
        let contents = new CreateDomElement({nameTag: 'p', idTag:'content'+key._id, classTag:'content', parentElement: key._id})
        if (key.content.length > 150){
            contents.innerHTML = key.content.slice(0,150)+"<a id='read_etc'>...</a>"
        } else {
            contents.textContent = key.content
        }
    }
// Удаление заметок
    async delete_note(key){
        let remove_element = new CreateDomElement({nameTag: 'a', classTag:'deleteNote', attributeTag:[['idElement', key._id]], parentElement: key._id, text:'×'})
        this.remove_elements(remove_element);
    }
// Редактирование заметок
    async update_note(key){
        new CreateDomElement({nameTag: 'div', classTag:'edit', idTag:'edit'+key._id, parentElement: key._id, })
        new CreateDomElement({nameTag: 'div', classTag:'edit-conteiner', idTag:'editC'+key._id, parentElement: 'edit'+key._id, })
        new CreateDomElement({nameTag:'input', idTag:'uptitle'+key._id, classTag: 'editTitle', attributeTag:[['type', 'text'], ['value', key.title]], parentElement:'editC'+key._id})
        new CreateDomElement({nameTag:'textarea', idTag:'upcontent'+key._id, classTag: 'editContent', attributeTag:[['value', key.content]], parentElement:'editC'+key._id}).innerText=key.content
        let clouseEditNote = new CreateDomElement({nameTag: 'a', classTag: 'closeEditNote', parentElement:'editC' + key._id, text: "Отменить изменения"})
        let editNote = new CreateDomElement({nameTag: 'a', classTag:'editNote', parentElement: key._id, text: 'Редактировать'})
        editNote.addEventListener('click', () => {
            document.getElementById('edit'+key._id).style.display = 'block'
        })
        clouseEditNote.addEventListener('click', () => {
            document.getElementById('edit' + key._id).style.display = 'none'
        })
        let updateNote = new CreateDomElement({nameTag: 'button', idTag:'update'+key._id, classTag:'saveNoteUpdate', parentElement:'editC'+key._id, text:'Редактровать'})
        updateNote.addEventListener('click', function(){
            fetch(location.origin+'/edit/'+key._id, 
                {method: 'PUT', headers:{'Accept':'application/json', 'Content-Type': 'application/json'}, 
                    body: JSON.stringify({title: document.getElementById('uptitle'+key._id).value, 
                    content: document.getElementById('upcontent'+key._id).value})})
                .then(res =>  res.json())
                .then(res => {
                    document.getElementById('edit' + key._id).style.display = 'none'
                    document.getElementById('title'+key._id).innerText = res.title
                    document.getElementById('content'+key._id).innerText = res.content
                })
        })
    }
    async notes_view(key, position){
        await this.view_note(key, position)
        await this.delete_note(key)
        await this.update_note(key)
    }
// Создание заметок
    create_note(){
        const create_ok = document.getElementById('create-ok');
        create_ok.addEventListener('click', () => {
            const title = document.getElementById('title');
            const content = document.getElementById('content')
            fetch(location.origin+'/create', {method:'POST', headers:{'Accept':'application/json', 'Content-Type': 'application/json'}, body: JSON.stringify({title: title.value, content: content.value})})
            .then(res => res.json())
            .then(res => {
                console.log(res)
                this.notes_view(res,'-')
                document.getElementById('createNote').style.display = 'none';
            })
        })

        document.getElementById('create').addEventListener('click', function(){
            document.getElementById('createNote').style.display = 'block';
        },false)
        
        document.getElementById('close_create').addEventListener('click', function(){
            document.getElementById('createNote').style.display = 'none';
        },false)
    }
    async remove_elements(el){
        let deleteNote1 = undefined;
        if(el !== undefined){
            deleteNote1 = [el]
        }else{
            deleteNote1 = document.querySelectorAll('.deleteNote')
        }
        for (let i of deleteNote1){
            i.addEventListener('click', function name(el) {
                fetch(location.origin+'/delete/'+this.attributes['idelement'].value,{method:'DELETE',headers:{'Accept':'application/json', 'Content-Type': 'application/json'}})
                .then(res => {
                    this.parentNode.remove()
                })
            })
        }
    }
    inits(){   
        fetch(location.origin+'/notes')
        .then(result => result.json())
        .then((result) => {
            new CreateDomElement({nameTag: 'div', idTag:'notes', classTag: 'notes', parentElement:'container'})
            if (result !== undefined && result.length !== 0){
                new Promise(async (reject,resolve)=>{
                    for (let key of result){
                       await this.notes_view(key)
                    }
                    reject();
                }).then((res)=>{
                    this.remove_elements();
                })
                
            }
        })

    }

    create_dom(){

        const logout = document.getElementById('logout')
        logout.addEventListener('click', ()=> {
            fetch(location.origin+'/logout', {method:"POST"})
            .then(res => res.json())
            .then((res)=>{
                location.href = '/';
            })
        })

        this.create_note()
    }
}

export {Main}