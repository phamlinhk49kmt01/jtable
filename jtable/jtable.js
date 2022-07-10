

(function ($) {

    var table = {
        data: [],
        element: null,
        options: null,
        init: function (options) {
            table.options = options;

            let id = $(this).attr('id');

            let $parent = $(this).parent();
            $($(this)).remove();
            table.element = $(`<div id="${id}" class="jtable-view" >`);
            table.element.append('<div class="jtable-header">');
            table.element.append('<div class="jtable-body">');
            table.element.append('<div class="jtable-footer">');
            $parent.prepend(table.element);
            table.renderHeader();

            if (typeof options.ajax != 'undefined') {
                table.getDataAjax().then(function (response) {
                    if (typeof options.ajax.dataResponse != 'undefined') {
                        table.data = options.ajax.dataResponse(response);
                    }
                    else {
                        table.data = response.products;
                    }
                    table.renderBody();
                });
            }
            else if (typeof options.data != 'undefined') {
                table.data = options.data;
                table.renderBody();
            }
        },
        getDataAjax: function () {
            var promise = new Promise(function (resolve, reject) {
                $.ajax({
                    url: table.options.ajax.url,
                    type: table.options.ajax.type,
                    data: table.options.ajax.data,
                    success: function (response) {
                        resolve(response);
                    },
                    error: function (error) {
                        reject(reject);
                    }
                });
            });
            return promise;
        },
        renderHeader: function () {
            let $header = $(`.jtable-header`);
            let $headerRow = $(`<div class="jtable-header-row">`);
            $header.append($headerRow);
            for (let indexColumn = 0; indexColumn < table.options.columns.length; indexColumn++) {
                const column = table.options.columns[indexColumn];
                let $headerItem = $(`<div class="jtable-header-item jtable-header-column-${indexColumn}" style="flex:1">`);
                $headerItem.text(column.title);
                $headerRow.append($headerItem);
            }
        },
        renderFooter: function(){},
        renderBody: function () {
            let _widthAvalible = $('.jtable-header').width();

            let _widthRowHeader = $('.jtable-header-item:last-child').offset().left - $('.jtable-header-row').offset().left + $('.jtable-header-item:last-child').width();

            console.log('_widthAvalible', _widthAvalible, '_widthRowHeader', _widthRowHeader);

            if (_widthRowHeader < _widthAvalible) {
                $('.jtable-header-row').addClass('full-width');
            }

            console.time("render");
            let $body = $('.jtable-body');
          
            if (table.data.length > 0) {
                let maxWidth = {};

                for (let indexRow = 0; indexRow < table.data.length; indexRow++) {
                    const row = table.data[indexRow];
                    let $row = $('<div class="jtable-body-row">');
                    $body.append($row);
                    for (let indexColumn = 0; indexColumn < table.options.columns.length; indexColumn++) {
                        const column = table.options.columns[indexColumn];
                        let content = row[column.data];
                        if (typeof column.render != 'undefined') {
                            content = column.render(row[column.data], row);
                        }
                        let $cell = $(`<div class="jtable-body-cell jtable-body-column-${indexColumn}">`).html(content);
                        if (typeof column.cssClass != 'undefined') {
                            $cell.addClass(column.cssClass)
                        }

                        $row.append($cell);
                        let $header = $(`.jtable-header-item.jtable-header-column-${indexColumn}`);
                        let headerWidth = $header.width();
                        let cellWidth = $cell.width();
                        if (maxWidth[`jtable-body-column-${indexColumn}`] == undefined || maxWidth[`jtable-body-column-${indexColumn}`] < cellWidth) {
                            if (cellWidth < headerWidth) {
                                maxWidth[`jtable-body-column-${indexColumn}`] = headerWidth;
                                $(`.jtable-header-column-${indexColumn}`).css('flex', '1');
                            }
                            else {
                                maxWidth[`jtable-body-column-${indexColumn}`] = cellWidth;
                                $(`.jtable-header-column-${indexColumn}`).css('flex', '');
                            }
                        }
                        $(`.jtable-header-column-${indexColumn}`).css('width', maxWidth[`jtable-body-column-${indexColumn}`] + 'px');
                        $(`.jtable-body-column-${indexColumn}`).css('width', maxWidth[`jtable-body-column-${indexColumn}`] + 'px');
                    }
                }

                let currentLeft = 0;
                $body.on('scroll', function () {
                    var left = $body.scrollLeft();
                    if (currentLeft != left) {
                        $('.jtable-header').scrollLeft(left);
                    }
                    currentLeft = left;
                });

                let _widthRowBody = $('.jtable-body-cell:last-child').offset().left - $('.jtable-body-row').offset().left + $('.jtable-body-cell:last-child').width();
                if (_widthRowBody < _widthAvalible) {
                    $('.jtable-header-row').addClass('full-width');
                }
                else {
                    $('.jtable-header-row').removeClass('full-width');
                    $('.jtable-header-row').addClass('max-width');
                }

                //console.log('scrollHeight', $body.get(0).scrollHeight, 'height', $body.height())
                if ($body.get(0).scrollHeight > $body.height()) {
                    let headerWidth = $('.jtable-header-row > :last').width();
                    $('.jtable-header-row >:last').css('width', `${headerWidth + 17}px`);
                }

            }
            else {
                let $row = $('<div class="jtable-body-row-empty">').text('Chưa có dữ liệu');
                $body.append($row);
            }



            console.timeEnd("render");



        }
    }

    $.fn.JTable = function (options) {
        return table.init.apply(this, arguments);
    };
})(jQuery);