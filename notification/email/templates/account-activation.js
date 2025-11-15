module.exports = `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<!DOCTYPE html>
<html dir="ltr" lang="en">
    <head>
        <meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />
        <meta name="x-apple-disable-message-reformatting" />
    </head>
    <div
        style="
            display: none;
            overflow: hidden;
            line-height: 1px;
            opacity: 0;
            max-height: 0;
            max-width: 0;
        "
    >
        {{app_name}} Email
    </div>

    <head>
        <meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />
        <meta name="x-apple-disable-message-reformatting" />
    </head>

    <body
        style="
            background-color: rgb(246, 244, 238);
            margin-top: auto;
            margin-bottom: auto;
            margin-left: auto;
            margin-right: auto;
            font-family: ui-sans-serif, system-ui, -apple-system,
                BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial,
                'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji',
                'Segoe UI Symbol', 'Noto Color Emoji';
            padding-left: 0.5rem;
            padding-right: 0.5rem;
            padding-top: 18px;
            padding-bottom: 18px;
        "
    >
        <table
            align="center"
            width="100%"
            border="0"
            cellpadding="0"
            cellspacing="0"
            role="presentation"
            style="margin-top: 32px"
        >
            <tbody>
                <tr>
                    <td>
                        <img
                            class="cover"
                            alt="{{app_name}}"
                            height="46"
                            src="https://res.cloudinary.com/diteiv723/image/upload/Group_1000007145_petkmt.png"
                            style="
                                display: block;
                                outline: none;
                                border: none;
                                text-decoration: none;
                                margin-top: 0px;
                                margin-bottom: 0px;
                                margin-left: auto;
                                margin-right: auto;
                            "
                            width="46"
                        />
                    </td>
                </tr>
            </tbody>
        </table>
        <table
            align="center"
            width="100%"
            border="0"
            cellpadding="0"
            cellspacing="0"
            role="presentation"
            style="
                max-width: 600px;
                border-width: 1px;
                border-style: solid;
                background-color: rgb(255, 255, 255);
                border-color: rgb(234, 234, 234);
                border-radius: 0.375rem;
                margin-top: 40px;
                margin-bottom: 40px;
                margin-left: auto;
                margin-right: auto;
                padding: 20px;
                padding-left: 30px;
                padding-right: 30px;
            "
        >
            <tbody>
                <tr style="width: 100%">
                    <td>
                        <p
                            style="
                                font-size: 14px;
                                line-height: 24px;
                                margin: 16px 0;
                                color: rgb(21, 21, 21);
                            "
                        >
                            Dear Traveller,
                        </p>
                        <p
                            style="
                                font-size: 14px;
                                line-height: 24px;
                                margin: 16px 0;
                                color: rgb(21, 21, 21);
                            "
                        >
                            Welcome to {{app_name}}. You’re now on a journey to easy
                            on-the-go transactions wherever you or your
                            collegues travel abroad
                        </p>
                        <p
                            style="
                                font-size: 14px;
                                line-height: 24px;
                                margin: 16px 0;
                                color: rgb(21, 21, 21);
                            "
                        >Please use the code below to verify your email address
                        </p>
                        <p style="font-size:22px;color:rgb(254,77,0);font-weight:700">{{otp}}</p>  
                      
                        <table
                            align="center"
                            width="100%"
                            border="0"
                            cellpadding="0"
                            cellspacing="0"
                            role="presentation"
                           
                        >
                            <tbody>
                                <tr>
                                    <td>
                                        <p
                                            style="
                                                font-size: 14px;
                                                line-height: 0px;
                                                margin: 16px 0;
                                                color: rgb(21, 21, 21);
                                            "
                                        >
                                            The World is Now Yours,
                                        </p>
                                        <p
                                            style="
                                                font-size: 14px;
                                                line-height: 24px;
                                                margin: 16px 0;
                                                color: rgb(21, 21, 21);
                                            "
                                        >
                                            <strong>{{app_name}} Crew</strong>
                                        </p>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </td>
                </tr>
            </tbody>
        </table>
    </body>
</html>
`;
