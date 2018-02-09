CKEDITOR.plugins.add( 'ksolr', {
    icons: 'ksolr',
    init: function( editor ) {
        editor.addCommand( 'ksolr', new CKEDITOR.dialogCommand( 'ksolrdialog' ) );
        editor.ui.addButton( 'ksolr', {
            label: 'Add Mandala resource',
            command: 'ksolr',
            toolbar: 'insert'
        });
        CKEDITOR.dialog.add( 'ksolrdialog', this.path + 'dialogs/ksolr.js' );
    }
});