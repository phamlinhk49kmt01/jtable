

(function ($) {

    $.fn.JTable = function (options) {
        var table = {
            data: {
                currentRows:[],
                rows: [],
                total: 0,
                skip: 0,
                limit: 50,
                keyword: '',
                column: '',
            },
            element: null,
            options: {
                showLoading: true,
                paging: true,
                isShowSTT: true,
                selectRow: false,
                selectMultiRow: false,
                onSelectRow: null,
                onSelectAllRow: null,
                drawCallback: null,
                height: null,
                ajax: {
                    url: null,
                    type: 'post',
                    data: null
                },
            },
            init: function (options) {
                let $loading = $(` <div class="jtable-loader hide"> <div class="loader" > <svg version="1.1" id="loader-1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="40px" height="40px" viewBox="0 0 50 50" style="enable-background:new 0 0 50 50;" xml:space="preserve"> <path fill="#000" d="M43.935,25.145c0-10.318-8.364-18.683-18.683-18.683c-10.318,0-18.683,8.365-18.683,18.683h4.068c0-8.071,6.543-14.615,14.615-14.615c8.072,0,14.615,6.543,14.615,14.615H43.935z"> <animateTransform attributeType="xml" attributeName="transform" type="rotate" from="0 25 25" to="360 25 25" dur="0.6s" repeatCount="indefinite"/> </path> </svg> loading ... </div> </div>`);

                Object.assign(table.options, options);
                $(this).empty();
                $(this).addClass('jtable-view');
                table.element = $(this);
                table.element.append($loading);
                table.element.append('<div class="jtable-header">');
                table.element.append('<div class="jtable-body">');
                table.element.append('<div class="jtable-footer">');

                $(window).resize(function () {
                    console.log('resize');
                    setTimeout(function () {
                        table.updateHeight();
                    }, 100)
                   
                });
                table.updateHeight();
                table.renderHeader();

               
              


                table.reload();
                return table;
            },
            search: function (keyword, column) {
                table.data.keyword = keyword;
                table.data.column = column;

                if (table.data.currentRows.length == 0 && table.data.rows.length > 0) {
                    table.data.currentRows = [...table.data.rows]
                }
                table.data.rows = table.data.currentRows.filter(item => item[column].toLowerCase().includes(keyword.toLowerCase()));
                table.data.total = table.data.rows.length;
                table.renderBody();
                table.renderPaging();
            },
            updateHeight: function () {
                $(table.element).css('height', `0px`);
                if (table.options.height != null) {
                    let height = table.options.height.contains('px') ? table.options.height : `${table.options.height}px`;
                    $(table.element).css('height', height);
                }
                else {
                    let total_height = 0;
                    let parent_height = $(table.element).parent().height();

                    $(table.element).parent().children().not('.jtable-view').each(function () {
                        total_height = total_height + $(this).outerHeight(true);
                    });

                    $(table.element).css('height', `${parent_height - total_height}px`);
                }
            },
            showLoading: function () {
                $('.jtable-loader').removeClass('hide');
            },
            hideLoading: function () {
                $('.jtable-loader').addClass('hide');
            },
            reload: function () {
                if (typeof table.options.ajax.url != 'undefined') {
                    table.getDataAjax();
                }
                else if (typeof table.data != 'undefined') {
                    table.data.rows = options.data;
                    table.renderBody();
                }
                else {
                    table.data.rows = [];
                    table.renderBody();
                }
            },
            getDataAjax: function () {
                new Promise(function (resolve, reject) {
                    var dataRequest = {};

                    if (table.options.ajax.url != null && table.options.paging) {
                        if (typeof table.options.ajax.data == 'undefined') {
                            dataRequest = {
                                limit: table.data.limit,
                                skip: table.data.skip
                            }
                        }
                        else {
                            dataRequest = table.options.ajax.data();
                            Object.assign(dataRequest, {
                                limit: table.data.limit,
                                skip: table.data.skip
                            });
                        }
                    }
                    $.ajax({
                        url: table.options.ajax.url,
                        type: table.options.ajax.type,
                        data: dataRequest,
                        beforeSend: function () {
                            if (table.options.showLoading) {
                                table.showLoading();
                            }

                        },
                        success: function (response) {
                            resolve(response);
                        },
                        error: function (error) {
                            reject(reject);
                        }
                    });
                }).then(function (response) {
                    table.data.currentRows = [];
                    if (typeof table.options.ajax.dataResponse != 'undefined') {
                        Object.assign(table.data, table.options.ajax.dataResponse(response));
                    }
                    else {
                        Object.assign(table.data, response);
                    }

                    if (table.data.keyword != '') {
                        table.search(table.data.keyword, table.data.column);
                    }
                    else {
                        table.renderBody();
                        table.renderPaging();
                    }

                    table.hideLoading();
                }).catch(function (error) {
                    table.renderBody();
                    table.renderPaging();
                    table.hideLoading();
                });
            },
            renderHeader: function () {
                let $header = $(table.element).find(`.jtable-header`);
                let $headerRow = $(`<div class="jtable-header-row">`);

                if (table.options.isShowSTT) {
                    table.options.columns.unshift({ title: '#', data: null })
                }

                if (table.options.selectRow) {
                    table.options.columns.unshift({ title: table.options.selectMultiRow == true ? '<input type="checkbox" class="jtable-check-all">' : '', data: null, selectRow: true, selectMultiRow: table.options.selectMultiRow })
                }


                $header.append($headerRow);
                for (let indexColumn = 0; indexColumn < table.options.columns.length; indexColumn++) {
                    const column = table.options.columns[indexColumn];
                    let $headerItem = $(`<div class="jtable-header-item jtable-header-column-${indexColumn}" style="flex:1">`);
                    $headerItem.html(column.title);
                    $headerRow.append($headerItem);
                }
            },
            renderBody: function () {
                let _widthAvalible = $(table.element).find('.jtable-header').width();

                let _widthRowHeader = $(table.element).find('.jtable-header-item:last-child').offset().left - $(table.element).find('.jtable-header-row').offset().left + $(table.element).find('.jtable-header-item:last-child').width();

                if (_widthRowHeader < _widthAvalible) {
                    $(table.element).find('.jtable-header-row').addClass('full-width');
                }
                table.updateHeight();
                //    console.time("render");
                let $body = $(table.element).find('.jtable-body');

                $body.empty();

                if (table.data.rows.length > 0) {
                    $(table.element).find(`.jtable-header-item`).css('flex', '');
                    let maxWidth = {};

                    let totalRow = table.data.rows.length
                    for (let indexRow = 0; indexRow < totalRow; indexRow++) {
                        const row = table.data.rows[indexRow];
                        let $row = $('<div class="jtable-body-row">');
                        $body.append($row);
                        for (let indexColumn = 0; indexColumn < table.options.columns.length; indexColumn++) {
                            const column = table.options.columns[indexColumn];

                            let content = "";
                            if (table.options.isShowSTT && column.title == '#') {
                                content = table.data.skip + indexRow + 1;
                            }

                            else {

                                if (column.selectRow == true) {
                                    content = '<input type="checkbox" class="jtable-check-row">';
                                }
                                else {
                                    content = `${row[column.data] == null ? '' : row[column.data]}`;
                                    if (typeof column.render != 'undefined') {
                                        content = column.render(row[column.data], row, indexRow);
                                    }
                                }
                            }

                            let $cell = $(`<div class="jtable-body-cell jtable-body-column-${indexColumn}">`).html(content);
                            if (typeof column.cssClass != 'undefined') {
                                $cell.addClass(column.cssClass)
                            }

                            $row.append($cell);
                            let $header = $(table.element).find(`.jtable-header-item.jtable-header-column-${indexColumn}`);
                            let headerWidth = $header.outerWidth(true);
                            let cellWidth = $cell.outerWidth(true);
                            if (maxWidth[`jtable-body-column-${indexColumn}`] == undefined || maxWidth[`jtable-body-column-${indexColumn}`] < cellWidth) {

                                if (cellWidth < headerWidth) {
                                    maxWidth[`jtable-body-column-${indexColumn}`] = headerWidth;
                                    // $(`.jtable-header-column-${indexColumn}`).css('flex', '1');
                                }
                                else {
                                    maxWidth[`jtable-body-column-${indexColumn}`] = cellWidth;
                                    // $(`.jtable-header-column-${indexColumn}`).css('flex', '');
                                }
                            }
                            $(table.element).find(`.jtable-header-column-${indexColumn}`).css('width', maxWidth[`jtable-body-column-${indexColumn}`] + 'px');
                            $(table.element).find(`.jtable-body-column-${indexColumn}`).css('width', maxWidth[`jtable-body-column-${indexColumn}`] + 'px');
                        }
                    }

                    //register event select all
                    if (table.options.selectMultiRow == true) {
                        (table.element).find('.jtable-check-all').prop('checked', false);
                        $(table.element).find('.jtable-check-all').unbind('change');
                        $(table.element).find('.jtable-check-all').change(function (e) {
                            e.stopPropagation();
                            let isChecked = $(this).is(':checked');
                            if (isChecked) {
                                $(table.element).find('.jtable-check-row').prop('checked', true);
                                $(table.element).find('.jtable-body-row').addClass('row-selected');

                                if (table.options.onSelectAllRow != null) {
                                    table.options.onSelectAllRow(table.getDataSelect());
                                }
                            }
                            else {
                                $(table.element).find('.jtable-check-row').prop('checked', false);
                                $(table.element).find('.jtable-body-row').removeClass('row-selected');
                            }
                        });
                    }
                    //register event check row
                    if (table.options.selectRow) {
                        $(table.element).find('.jtable-check-row').unbind('change');
                        $(table.element).find('.jtable-check-row').change(function (e) {
                            e.stopPropagation();
                            let isChecked = $(this).is(':checked');
                            if (isChecked) {
                                $(this).parents('.jtable-body-row').addClass('row-selected');
                                let totalCheck = $(table.element).find('.jtable-body-row.row-selected').length;
                                let totalRow = $(table.element).find('.jtable-body-row').length;
                                if (totalCheck == totalRow) {
                                    $(table.element).find('.jtable-check-all').prop('checked', true);
                                }

                                if (table.options.onSelectRow != null) {
                                    table.options.onSelectRow(table.getDataSelect($(this).parents('.jtable-body-row').index()));
                                }
                            }
                            else {
                                $(this).parents('.jtable-body-row').removeClass('row-selected');
                                $(table.element).find('.jtable-check-all').prop('checked', false);
                            }
                        });
                    }


                    $body.unbind('scroll');
                    $body.on('scroll', function () {
                        var left = $body.scrollLeft();
                        if (table.currentScrollLeft != left) {
                            $(table.element).find('.jtable-header').scrollLeft(left);
                            table.currentScrollLeft = left;
                        }
                    });

                    if ($body.get(0).scrollHeight > $body.height()) {
                        let headerWidth = $(table.element).find('.jtable-header-row > :last').outerWidth(true);

                        if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
                            // no things
                        }
                        else {
                            $(table.element).find('.jtable-header-row > :last').css('width', `${headerWidth + 17}px`);
                        }
                    }
                    if (table.options.drawCallback != null) {
                        table.options.drawCallback();
                    }

                }
                else {
                    $(table.element).find(`.jtable-header-item`).css('flex', '1');
                    let $row = $('<div class="jtable-body-row-empty">').text('Chưa có dữ liệu');
                    $body.append($row);
                }

                if (table.currentScrollLeft != undefined) {
                    $('.jtable-header').scrollLeft(table.currentScrollLeft);
                    $body.scrollLeft(table.currentScrollLeft);
                }
                table.renderPaging();

                //     console.timeEnd("render");

            },
            renderPaging: function () {

                let $footer = $(table.element).find(`.jtable-footer`);
                $footer.empty();

                if (!table.options.paging) {
                    return;
                }

                let $pagingInfo = $('<div class="jtable-footer-paging-info width-50">');
                let $pagingButton = $('<div class="jtable-footer-paging-button width-50">');
                $footer.append($pagingButton);
                $footer.append($pagingInfo);
                $pagingInfo.html(`Hiển thị dòng ${table.data.rows.length > 0 ? table.data.skip + 1 : 0}  đến dòng ${table.data.rows.length + table.data.skip} trên ${table.data.total} dòng.`);

                let $nextBtn = $(`<button class="btn-next" type="button">`).text('>');
                let $prevBtn = $('<button class="btn-prev" type="button">').text('<');

                $pagingButton.append($prevBtn);
                $pagingButton.append($nextBtn);

                let $totalPage = $('<span class="total-page">');
                $pagingButton.append($totalPage);
                table.updateTotalPage();

                $nextBtn.click(function (e) {
                    e.stopPropagation();
                    if (table.data.skip + table.data.rows.length < table.data.total) {
                        table.data.skip += table.data.limit;
                        console.log(table.data.skip)
                        table.getDataAjax();
                    }
                });

                $prevBtn.click(function (e) {
                    e.stopPropagation();
                    if (table.data.skip >= table.data.limit) {
                        table.data.skip -= table.data.limit;
                        console.log(table.data.skip)
                        table.getDataAjax();
                    }
                });


            },
            updateTotalPage: function () {

                let totalPage = 0;
                if (table.data.total % table.data.limit == 0) {
                    totalPage = Math.floor(table.data.total / table.data.limit)
                }
                else {
                    totalPage = Math.floor(table.data.total / table.data.limit) + 1;
                }

                let pageIndex = 1;
                if ((table.data.limit + table.data.skip) % table.data.limit == 0) {
                    pageIndex = Math.floor((table.data.limit + table.data.skip) / table.data.limit);
                }
                else {
                    pageIndex = Math.floor((table.data.limit + table.data.skip) / table.data.limit) + 1;
                }

                table.element.find('.total-page').html(`${totalPage > 0 ? pageIndex : 0}&nbsp;/&nbsp;${totalPage}`);

            },
            getDataSelect(index) {
                if (index == undefined) {
                    if (table.options.selectMultiRow == true) {
                        let dataSelected = [];
                        $(table.element).find('.jtable-body-row').each(function (i, item) {
                            if ($(item).hasClass('row-selected')) {
                                dataSelected.push(table.data.rows[i]);
                            }
                        });
                        return dataSelected;
                    }
                    else {
                        return (table.data.rows($('.jtable-body-row.row-selected').index()));
                    }
                }
                return table.data.rows[index];
            },
            dataRow: function (element) {
                let index = $(element).parents('.jtable-body-row').index();
                return table.data.rows[index] ?? {};
            },
            unSelectAll: function () {
                $(table.element).find('.jtable-check-all').click();
            },
            destroy: function () {
                table.element.empty();
            }
        }
        return table.init.apply(this, arguments);
    };
})(jQuery);

