let allPostObj ={};

const leftBarList = document.getElementById('leftbar-list');
const postCloseBtn = document.getElementById('post-close-btn');
const searchBar = document.getElementById('search-text');
const welcomePageContainer = document.getElementById('rightbar-welcome-page-container');
const postPageContainer =  document.getElementById('post-page-container');
const commentList = document.getElementById('comment-list');
const postPagePostContainer =document.getElementById('post-page-post-container');
postPageContainer.style.display='none';

fetchAllPost();
postCloseBtn.addEventListener('click', showWelcomeSide);

searchBar.addEventListener('keyup', ()=>{
    leftBarList.innerHTML='';
    if(searchBar.value.trim()!=''){
        let search = searchBar.value.trim();
        if(search[0]==='@'){
            let username = search.slice(1,search.length);
            for (const post of Object.values(allPostObj)) {
                if(new RegExp(username, "i").test(post.userDetail.username)){
                    insertQuestionInHTML(post);
                    if(username.length>1){
                        highlightSearched(username, true);
                    }
                    
                }
            }
        }else{
            for (const post of Object.values(allPostObj)) {
                if(new RegExp(search, "i").test(post.title) || new RegExp(search, "i").test(post.body)){
                    insertQuestionInHTML(post);
                    if(search.length>3){
                        highlightSearched(search, false);
                    }
                    
                }
            }
        }
    }
    else{
        for (const value of Object.values(allPostObj)) {
            insertQuestionInHTML(value);
        }
    }
});

leftBarList.addEventListener('click', (event)=>{
    let invoker = event.target;

    if(invoker.classList.contains('post-container')||
    invoker.classList.contains('post-title') ||
    invoker.classList.contains('post-body') ||
    invoker.classList.contains('post-extra-container') ||
    invoker.classList.contains('post-creation-detail')){
        welcomePageContainer.style.display = 'none';
        postPageContainer.style.display = 'flex';
        let postId = invoker.id.split('-')[1];
        let currentPost = allPostObj['post-'+postId];
        showPostInRightBar(currentPost);
        highLightCurrentPost(postId);
        
    }
});

function highLightCurrentPost(postId){
    Array.from(document.getElementsByClassName('highlight-post')).forEach((ele)=>{
        ele.classList.remove('highlight-post');
    });
    document.getElementById('post-'+postId+'-container').classList.add('highlight-post');

}

function highlightSearched(text, usedUsername){
    if(usedUsername){
        Array.from(document.getElementsByClassName('post-creation-detail')).forEach((ele)=>{
            let ogText = ele.innerText.toString();
            let newText = ogText;
            let pos = newText.search(new RegExp(text, "ig"));
            let rep = newText.slice(pos,  pos + text.length);
            ogText = ogText.replace(rep, "<highlight>"+rep+"</highlight>" );
            ele.innerHTML =  ogText;
        });
    }else{
        Array.from(document.getElementsByClassName('post-title')).forEach((ele)=>{
            if(!ele.classList.contains('rightbar-post-title')){
                let ogText = ele.innerText.toString();
                let newText = ogText;
                let pos = newText.search(new RegExp(text, "ig"));
                while (pos !== -1) {
                    let rep = newText.slice(pos,  pos + text.length);
                    ogText = ogText.replace(rep, "<highlight>"+rep+"</highlight>" );
                    newText = newText.slice(pos + text.length, newText.length);
                    pos = newText.search(new RegExp(text, "ig"));
                }
                ele.innerHTML =  ogText;
            }
        });
        Array.from(document.getElementsByClassName('post-body')).forEach((ele)=>{
            if(!ele.classList.contains('rightbar-post-body')){
                let ogText = ele.innerText.toString();
                let newText = ogText;
                let pos = newText.search(new RegExp(text, "ig"));
                while (pos !== -1) {
                    let rep = newText.slice(pos,  pos + text.length);
                    ogText = ogText.replace(rep, "<highlight>"+rep+"</highlight>" );
                    newText = newText.slice(pos + text.length, newText.length);
                    pos = newText.search(new RegExp(text, "ig"));
                }
                ele.innerHTML =  ogText;
            }
        });
    }   
}

function showWelcomeSide(){
    Array.from(document.getElementsByClassName('highlight-post')).forEach((ele)=>{
        ele.classList.remove('highlight-post');
    });
    postPageContainer.style.display = 'none';
    welcomePageContainer.style.display = 'flex';
}

function updateLocalStorage(arr){
    localStorage.setItem("discussion_portal_ques_obj", JSON.stringify(arr));
}

async function getComments(postId){
    let comment = {};
    await fetch(`https://jsonplaceholder.typicode.com/posts/${postId}/comments`)
    .then((response) => response.json())
    .then((comments)=> comment = comments);
    return comment;
}

async function fetchAllPost(){

    leftBarList.innerHTML = '<div class="loader-post"></div>';
    await fetch('https://jsonplaceholder.typicode.com/posts')
    .then((response) => response.json())
    .then((posts)=> {
        for (const value of Object.values(posts)) {
            allPostObj['post-'+value.id] = value;
        }
    });
    
    if (allPostObj!={}){
        leftBarList.innerHTML="";
        for (const value of Object.values(allPostObj)) {
            await fetch(`https://jsonplaceholder.typicode.com/users/${value.userId}`)
            .then((response) => response.json())
            .then((user)=>value.userDetail=user)
            .catch((err)=>value.userDetail={});
            if(searchBar.value.trim()=='')
                insertQuestionInHTML(value);
        }
    }
}

function insertQuestionInHTML(post){
    leftBarList.appendChild(createPost(post));
}

function insertCommentInPostPage(comment){
    if(comment.id===null){
        commentList.innerText='No Comment Yet!';
    }else if(commentList.innerText==='No Comment Yet!'){
        commentList.innerHTML='';
        commentList.appendChild(createComment(comment));
    }else{
        commentList.appendChild(createComment(comment));
    }
}

function createPost(post){
    let postContainer;
    if(leftBarList.childElementCount>0){
        postContainer = leftBarList.firstElementChild.cloneNode(true);
        postContainer.id= 'post-'+post.id+'-container';
        postContainer.children[0].id= 'post-'+post.id+'-title';
        postContainer.children[0].innerText = post.title;
        postContainer.children[1].id= 'post-'+post.id+'-body';
        postContainer.children[1].innerText = post.body.replace("\n"," ");
        postContainer.children[2].id='post-'+post.id+'-extra-container';
        postContainer.children[2].children[0].id= 'post-'+post.id+'-creation-detail';
        postContainer.children[2].children[0].innerText = makeUserDetailString(post.userDetail);
    }else{
        postContainer = document.createElement('div');
        postContainer.classList.add('post-container');
        postContainer.id= 'post-'+post.id+'-container';

        let postTitle = document.createElement('span');
        postTitle.classList.add('post-title');
        postTitle.id= 'post-'+post.id+'-title';
        postTitle.innerText = post.title;

        let postBody = document.createElement('span');
        postBody.classList.add('post-body');
        postBody.id= 'post-'+post.id+'-body';
        postBody.innerText = post.body.replace("\n"," ");

        let postExtraContainer = document.createElement('div');
        postExtraContainer.classList.add('post-extra-container');
        postExtraContainer.id='post-'+post.id+'-extra-container';

        let postCreationDetail = document.createElement('span');
        postCreationDetail.classList.add('post-creation-detail');
        postCreationDetail.classList.add('creation-detail');
        postCreationDetail.id= 'post-'+post.id+'-creation-detail';
        postCreationDetail.innerText = makeUserDetailString(post.userDetail);


        postExtraContainer.appendChild(postCreationDetail);

        postContainer.appendChild(postTitle);
        postContainer.appendChild(postBody);
        postContainer.appendChild(postExtraContainer);
    }
    return postContainer;
}

function createComment(comment){

    let commentContainer ;
    if(commentList.childElementCount>0){
        commentContainer = commentList.firstElementChild.cloneNode(true);
        commentContainer.id= 'comment-'+comment.id+'-container';
        commentContainer.childNodes[0].id= 'comment-'+comment.id+'-name';
        commentContainer.childNodes[0].innerText = comment.name.slice(0,10);
        commentContainer.childNodes[1].id= 'comment-'+comment.id+'-body';
        commentContainer.childNodes[1].innerText = comment.body.replace("\n"," ");
        commentContainer.childNodes[2].id= 'comment-'+comment.id+'-creation-detail';
        commentContainer.childNodes[2].innerText = makeUserDetailString({email: comment.email});
    }
    else{
        commentContainer = document.createElement('div');
        commentContainer.classList.add('comment-container');
        commentContainer.id= 'comment-'+comment.id+'-container';

        let commentName = document.createElement('span');
        commentName.classList.add('comment-name');
        commentName.id= 'comment-'+comment.id+'-name';
        commentName.innerText = comment.name.slice(0,10);

        let commentBody = document.createElement('span');
        commentBody.classList.add('comment-body');
        commentBody.id= 'comment-'+comment.id+'-body';
        commentBody.innerText = comment.body.replace("\n"," ");

        let commentCreationDetail = document.createElement('span');
        commentCreationDetail.classList.add('comment-creation-detail');
        commentCreationDetail.classList.add('creation-detail');
        commentCreationDetail.id= 'comment-'+comment.id+'-creation-detail';
        commentCreationDetail.innerText = makeUserDetailString({email: comment.email});

        commentContainer.appendChild(commentName);
        commentContainer.appendChild(commentBody);
        commentContainer.appendChild(commentCreationDetail);
    }

    return commentContainer;
}

function showPostInRightBar(post){
    if(postPagePostContainer.children[0].id!=='post-page-post-'+post.id+'-title'){
        postPagePostContainer.children[0].id='post-page-post-'+post.id+'-title';
        postPagePostContainer.children[1].id='post-page-post-'+post.id+'-body';
        postPagePostContainer.children[0].innerText=post.title;
        postPagePostContainer.children[1].innerText=post.body;
        postPagePostContainer.parentElement.children[2].id= 'post-'+post.id+'-user-detail';
        postPagePostContainer.parentElement.children[2].children[0].id= 'post-'+post.id+'-user-uname';
        postPagePostContainer.parentElement.children[2].children[0].innerText = "Username : "+post.userDetail.username;
        postPagePostContainer.parentElement.children[2].children[1].id= 'post-'+post.id+'-user-email';
        postPagePostContainer.parentElement.children[2].children[1].innerText = "Email : "+post.userDetail.email;

        showPostComments(post);
    }
}

async function showPostComments(post){
    commentList.innerHTML = '';
    if(!post["comments"]){
        commentList.innerHTML ='<div class="loader-comment"></div>'; ;
        post["comments"]= await getComments(post.id);
    }
    if(Object.values(post["comments"]).length !== 0){
        commentList.innerHTML = '';
        for (const value of Object.values(post["comments"])) {
            insertCommentInPostPage(value);
        }
    }else{
        insertCommentInPostPage({id:null});
    }
}

function makeUserDetailString(userDetail) {
    
    if(userDetail.username || userDetail.email){
        let str = "Posted by ";
        if(userDetail.username){
            str= str + "@"+userDetail.username+" " ;
        }
        if(userDetail.email){
            str = str + "Mail: "+userDetail.email;
        }
        return str;
    }else{
        return "Posted by Unknown User";
    }
 }
