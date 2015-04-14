/**
 * Implements hook_install().
 */
function gp_app_install() {
    try {
        var css = drupalgap_get_path('module', 'gp_app') + '/gp_app.css';
        drupalgap_add_css(css);
    }
    catch (error) { console.log('gp_app_install - ' + error); }
}

/**
 * Implements hook_menu().
 */
function gp_app_menu() {
    var items = {};
    items['hello_world'] = {
        title: 'Gig Planning',
        page_callback: 'gp_app_hello_world_page'
    };
    items['gigs'] = {
        title: 'Upcoming Gigs',
            page_callback: 'gigs'
        };
    items['gp_app_dashboard'] = {
        title: 'GIGplanning',
        page_callback: 'gp_app_dashboard'
    };

    return items;
}

/**
 * The callback for the "Hello World" page.
 */
function gp_app_hello_world_page() {
    var content = {};
    content['my_button'] = {
        theme: 'button',
        text: 'Gigplanning',
        attributes: {
            onclick: "drupalgap_alert('Hi!')"
        }
    };
    return content;
}

function gp_app_dashboard() {
    try {
        var css = drupalgap_get_path('module', 'gp_app') + '/gp_app.css';
        drupalgap_add_css(css);
    }
    catch (error) { console.log('gp_app_install - ' + error); }

    try {
        var content = {};
        content.site_info = {
            markup: '<h4 style="text-align: center;">' +
            Drupal.settings.site_path +
            '</h4>'
        };
        content.welcome = {
            markup: '<h2 style="text-align: center;">Welcome to GIGPlanning</h2>' +
            '<p style="text-align: center;">' +
            'Band Management!' +
            '</p>'
        };
        /*if (drupalgap.settings.gp_logo) {
            content.logo = {
                markup: '<center>' +
                theme('image', {path: drupalgap.settings.gp_logo}) +
                '</center>'
            };
        }*/
        content.logo = {
            markup: '<center>' +
            theme('image', {path: drupalgap.settings.gp_logo}) +
            '</center>'
        };
        content.get_started = {
            theme: 'button_link',
            text: 'Getting Started Guide',
            path: 'http://www.drupalgap.org/get-started',
            options: {InAppBrowser: true}
        };
        content.support = {
            theme: 'button_link',
            text: 'Support',
            path: 'http://www.drupalgap.org/support',
            options: {InAppBrowser: true}
        };
        return content;
    }
    catch (error) {
        console.log('gp_app_dashboard - ' + error);
    }
}

/**
 * The page callback to display the 'gigs' view.
 */
function gigs() {
    try {
        var content = {};
        content['gigs_list'] = {
            theme: 'view',
            format: 'ul',
            path: 'app-optredens', /* the path to the view in Drupal */
            row_callback: 'gigs_list_row',
            empty_callback: 'gigs_list_empty',
            attributes: {
                id: 'gigs_list_view'
            }
        };
        return content;
    }
    catch (error) {
        console.log('gigs_page - ' + error);
    }
}

/**
 * The row callback to render a single row.
 */
function gigs_list_row(view, row) {
    try {
        console.log(row);
        /*return l(row.title + ' TEST', 'node/' + 606);*/
        return l(row.title, 'node/' + row.Nid);
    }
    catch (error) { console.log('gigs_list_row - ' + error); }
}

/**
 *
 */
function gigs_list_empty(view) {
    try {
        return 'Sorry, no gigs were found.';
    }
    catch (error) { console.log('gigs_list_empty - ' + error); }
}

/**
 * Implements hook_node_page_view_alter_TYPE().
 */
function gp_app_node_page_view_alter_TEST(node, options) {
    try {
        console.log('NODE', node);
         // custom content text
        var my_markup = '<p>Click the button to see the article!</p>';
        var my_collapsible = theme('collapsible', {
                header: node.title,
                content: node.content
            }
        );

        // Build the node display. normally this will contain the node markup (node.content)
        var build = {
            'content': {
                'markup': ''
            }
        };

        // add custom context to build
        build.content.markup += my_markup + my_collapsible;

        // If comments are undefined, just inject the page.
        if (typeof node.comment === 'undefined') {
            _drupalgap_entity_page_container_inject(
                'node', node.nid, 'view', build
            );
        }

        // If the comments are closed (1) or open (2), show the comments.
        else if (node.comment != 0) {
            if (node.comment == 1 || node.comment == 2) {
                // Render the comment form, so we can add it to the content later.
                var comment_form = '';
                if (node.comment == 2) {
                    comment_form = drupalgap_get_form(
                        'comment_edit',
                        { nid: node.nid },
                        node
                    );
                }
                // If there are any comments, load them.
                if (node.comment_count != 0) {
                    var query = {
                        parameters: {
                            nid: node.nid
                        }
                    };
                    comment_index(query, {
                        success: function(results) {
                            try {
                                // Render the comments.
                                var comments = '';
                                $.each(results, function(index, comment) {
                                    comments += theme('comment', { comment: comment });
                                });
                                build.content.markup += theme('comments', {
                                    node: node,
                                    comments: comments
                                });
                                // If the comments are open, show the comment form.
                                if (node.comment == 2) {
                                    build.content.markup += comment_form;
                                }
                                // Finally, inject the page.
                                _drupalgap_entity_page_container_inject(
                                    'node', node.nid, 'view', build
                                );
                            }
                            catch (error) {
                                var msg = 'node_page_view_pageshow - comment_index - ' +
                                    error;
                                console.log(msg);
                            }
                        }
                    });
                }
                else {
                    // There weren't any comments, append an empty comments wrapper
                    // and show the comment form if comments are open, then inject
                    // the page.
                    if (node.comment == 2) {
                        build.content.markup += theme('comments', { node: node });
                        build.content.markup += comment_form;
                    }
                    _drupalgap_entity_page_container_inject(
                        'node', node.nid, 'view', build
                    );
                }
            }
        }
        else {
            // Comments are hidden (0), append an empty comments wrapper to the
            // content and inject the content into the page.
            build.content.markup += theme('comments', { node: node });
            _drupalgap_entity_page_container_inject(
                'node', node.nid, 'view', build
            );
        }
    }
    catch (error) { console.log('gp_app_node_page_view_alter_optreden - ' + error); }

}
