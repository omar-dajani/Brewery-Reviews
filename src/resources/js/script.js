function populateModal (id) {
    text = document.getElementById("card-" + id).innerHTML;
    document.getElementById("brewery-name").value = text;
}