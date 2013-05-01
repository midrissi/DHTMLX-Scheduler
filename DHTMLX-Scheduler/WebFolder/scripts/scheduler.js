function initScheduler(containerID, date, view, syncObj) {
    var
    html = '',
        mappingObj = _ns.Mapping.getInstance();

    function show_minical() {
        if (scheduler.isCalendarVisible())
            scheduler.destroyCalendar();
        else
            scheduler.renderCalendar({
                position: "dhx_minical_icon",
                date: scheduler._date,
                navigation: true,
                handler: function (date, calendar) {
                    scheduler.setCurrentView(date);
                    scheduler.destroyCalendar()
                }
            });
    }

    $('#dhx_minical_icon').live({
        click: function () {
            show_minical();
        }
    });

    scheduler.xy = $.extend({}, scheduler.xy, {
        scale_height: 41,
        min_event_height: 100
    });

    scheduler.config = $.extend({}, scheduler.config, {
        full_day: false,
        repeat_date: "%m/%d/%Y",
        hour_size_px: 132,
        separate_short_events: true,
        details_on_dblclick: true,
        xml_date: "%Y-%m-%d %H:%i",
        multi_day: false,
        details_on_create: true,
        fix_tab_position: false,
        first_hour: 0,
        last_hour: 24,
        drag_lightbox: true,
        show_loading: true,
        minicalendar: {
            mark_events: true
        },
        buttons_left: ["dhx_cancel_btn"],
        buttons_right: [],
        server_utc: true
    });

    scheduler.render_event_bar = function (a) {
        var b = this._rendered_location,
            c = this._colsS[a._sday],
            d = this._colsS[a._eday];
        d == c && (d = this._colsS[a._eday + 1]);
        var e = this.xy.bar_height,
            f = a.id == this._drag_id ? 0 : a._sorder * e,
            g = this._colsS.heights[a._sweek] + (this._colsS.height ? this.xy.month_scale_height + 2 : 2) + f,
            h = document.createElement("DIV"),
            k = "dhx_cal_event_clear";
        a._timed || (k = "dhx_cal_event_line", a.hasOwnProperty("_first_chunk") && a._first_chunk && (k += " dhx_cal_event_line_start"), a.hasOwnProperty("_last_chunk") &&
            a._last_chunk && (k += " dhx_cal_event_line_end"));
        var i = scheduler.templates.event_class(a.start_date, a.end_date, a);
        i && (k = k + " " + i);
        var j = a.color ? "color:" + a.color + ";" : "",
            m = a.textColor ? "color:" + a.textColor + ";" : "",
            n = '<div event_id="' + a.id + '" class="' + k + '" style="position:absolute; top:' + g + "px; left:" + c + "px; width:" + (d - c - 15) + "px;" + m + "" + j + "" + (a._text_style || "") + '">',
            a = scheduler.getEvent(a.id);
        a._timed && (n += scheduler.templates.event_bar_date(a.start_date, a.end_date, a));
        n += scheduler.templates.event_bar_text(a.start_date,
            a.end_date, a) + "</div>";
        n += "</div>";
        h.innerHTML = n;
        this._rendered.push(h.firstChild);
        b.appendChild(h.firstChild)
    };

    scheduler.config = $.extend({}, scheduler.config, {
        buttons_left: ["dhx_cancel_btn", "dhx_delete_btn"],
        buttons_right: ["dhx_save_btn"]
    });

    scheduler.attachEvent("onEventChanged", function (event_id, event_object) {
        if (event_id.toString().lastIndexOf('#') < 0) {
            mappingObj.saveSource(event_id, event_object);
        }
    });

    scheduler.attachEvent("onBeforeEventDelete", function (event_id, event_object) {
        if (event_object._dont_save) {
            delete event_object._dont_save;
            return true;
        }

        if (event_object.event_pid) {
            event_object.rec_type = "none";
            mappingObj.saveSource(event_id, event_object);
        } else {
            var opts = {
                onSuccess: function (e) {
                    e.dataSource.removeCurrent();
                }
            }
            if (event_object._position) {
                mappingObj.source.select(mappingObj.getRealPosition(event_object._position), opts);
            } else {
                mappingObj.source.selectByKey(event_id, opts);
            }
        }

        return true;
    });

    scheduler.attachEvent("onEventAdded", function (event_id, event_object) {
        if (event_object._dont_save) {
            delete event_object._dont_save;
            return;
        } else {
            event_object._new = true;
            mappingObj.saveSource(event_id, event_object);
        }
    });

    scheduler.attachEvent("onBeforeDrag", function (event_id, mode, native_event_object) {
        switch (mode) {
        case 'move':
        case 'resize':
            console.log(mode);
            if (false) {
                delete scheduler._ignore_click;
            } else {
                scheduler._ignore_click = true;
                mappingObj.select(scheduler.getEvent(event_id));
            }
            break;
        }

        return true;
    });

    scheduler.renderEvent = function (container, ev) {
        var
        $cont = $(container);

        var html = "<div class='dhx_event_move dhx_header event_subElement' style='width:100%'>&nbsp;</div>";

        html += '<div class="dhx_event_move dhx_title event_subElement" style="height:15px;">' + scheduler.templates.event_date(ev.start_date) + ' - ' + scheduler.templates.event_date(ev.end_date) + '</div>';

        html += '<div class="dhx_event_move dhx_body event_subElement" style="cursor:pointer;width:' + ($cont.width() - 10) + 'px;height:' + ($cont.height() - 32) + 'px">';

        html += ev.text;

        html += "</div>";

        // resize section
        html += "<div class='dhx_event_resize dhx_footer event_subElement' style='width:100%'></div>";

        $cont.append(html).find('.event_subElement').css({
            'background-color': ev.color
        });

        return true;
    }

    html += '<div class="dhx_cal_navline" height="100px">';
    html += '<div class="dhx_cal_prev_button">&nbsp;</div>';
    html += '<div class="dhx_cal_next_button">&nbsp;</div>';
    html += '<div class="dhx_cal_today_button"></div>';
    html += '<div class="dhx_cal_date" style="width: auto;right: 450px;"></div>';
    html += '<div class="dhx_cal_tab dhx_cal_tab_first" name="day_tab" style="right: 342px;"></div>';
    html += '<div class="dhx_cal_tab" name="week_tab" style="right:281px;"></div>';
    html += '<div class="dhx_cal_tab dhx_cal_tab_last" name="month_tab" style="right: 220px;"></div>';
    html += '<div class="dhx_cal_date"></div>';
    html += '<div class="dhx_minical_icon" id="dhx_minical_icon" style="right: 410px;left:auto;">&nbsp;</div>';
    html += '</div>';
    html += '<div class="dhx_cal_header">';
    html += '</div>';
    html += '<div class="dhx_cal_data">';
    html += '</div>';

    $('#' + containerID)
        .empty()
        .append(html)
        .addClass('dhx_cal_container calendar');

    scheduler.init(containerID, date, view);

    return _ns.syncWithDS(syncObj);
}
