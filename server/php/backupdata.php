<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept");
header("Access-Control-Allow-Methods: POST, GET, PUT");


error_reporting(E_ALL);
ini_set('display_errors', '1');

include 'crypto.php';


function get_random_quote()
{
    $quotes = [
        "The greatest glory in living lies not in never falling, but in rising every time we fall. -Nelson Mandela",
        "The way to get started is to quit talking and begin doing. -Walt Disney",
        "Your time is limited, so don't waste it living someone else's life. Don't be trapped by dogma – which is living with the results of other people's thinking. -Steve Jobs",
        "If life were predictable it would cease to be life, and be without flavor. -Eleanor Roosevelt",
        "If you look at what you have in life, you'll always have more. If you look at what you don't have in life, you'll never have enough. -Oprah Winfrey",
        "If you set your goals ridiculously high and it's a failure, you will fail above everyone else's success. -James Cameron",
        "Life is what happens when you're busy making other plans. -John Lennon",
        "Spread love everywhere you go. Let no one ever come to you without leaving happier. -Mother Teresa",
        "When you reach the end of your rope, tie a knot in it and hang on. -Franklin D. Roosevelt",
        "Always remember that you are absolutely unique. Just like everyone else. -Margaret Mead",
        "Don't judge each day by the harvest you reap but by the seeds that you plant. -Robert Louis Stevenson",
        "The future belongs to those who believe in the beauty of their dreams. -Eleanor Roosevelt",
        "Tell me and I forget. Teach me and I remember. Involve me and I learn. -Benjamin Franklin",
        "The best and most beautiful things in the world cannot be seen or even touched — they must be felt with the heart. -Helen Keller",
        "It is during our darkest moments that we must focus to see the light. -Aristotle",
        "Whoever is happy will make others happy too. -Anne Frank",
        "Do not go where the path may lead, go instead where there is no path and leave a trail. -Ralph Waldo Emerson",
        "Spread love everywhere you go. Let no one ever come to you without leaving happier. -Mother Teresa",
        "When you reach the end of your rope, tie a knot in it and hang on. -Franklin D. Roosevelt",
        "Always remember that you are absolutely unique. Just like everyone else. -Margaret Mead",
        "Don't judge each day by the harvest you reap but by the seeds that you plant. -Robert Louis Stevenson",
        "The future belongs to those who believe in the beauty of their dreams. -Eleanor Roosevelt",
        "Famous quote by Eleanor Roosevelt6. Tell me and I forget. Teach me and I remember. Involve me and I learn. -Benjamin Franklin",
        "The best and most beautiful things in the world cannot be seen or even touched - they must be felt with the heart. -Helen Keller",
        "It is during our darkest moments that we must focus to see the light. -Aristotle",
        "Whoever is happy will make others happy too. -Anne Frank",
        "Do not go where the path may lead, go instead where there is no path and leave a trail. -Ralph Waldo Emerson",
        "You will face many defeats in life, but never let yourself be defeated. -Maya Angelou",
        "The greatest glory in living lies not in never falling, but in rising every time we fall. -Nelson Mandela",
        "In the end, it's not the years in your life that count. It's the life in your years. -Abraham Lincoln",
        "Never let the fear of striking out keep you from playing the game. -Babe Ruth",
        "Life is either a daring adventure or nothing at all. -Helen Keller",
        "Many of life's failures are people who did not realize how close they were to success when they gave up. -Thomas A. Edison",
        "You have brains in your head. You have feet in your shoes. You can steer yourself any direction you choose. -Dr. Seuss",
        "If life were predictable it would cease to be life and be without flavor. -Eleanor Roosevelt",
        "In the end, it's not the years in your life that count. It's the life in your years. -Abraham Lincoln",
        "Life is a succession of lessons which must be lived to be understood. -Ralph Waldo Emerson",
        "You will face many defeats in life, but never let yourself be defeated. -Maya Angelou",
        "Never let the fear of striking out keep you from playing the game. -Babe Ruth",
        "Life is never fair, and perhaps it is a good thing for most of us that it is not. -Oscar Wilde",
        "The only impossible journey is the one you never begin. -Tony Robbins",
        "In this life we cannot do great things. We can only do small things with great love. -Mother Teresa",
        "Only a life lived for others is a life worthwhile. -Albert Einstein",
        "The purpose of our lives is to be happy. -Dalai Lama",
        "Life is what happens when you're busy making other plans. -John Lennon",
        "You only live once, but if you do it right, once is enough. -Mae West",
        "Live in the sunshine, swim the sea, drink the wild air. -Ralph Waldo Emerson",
        "Go confidently in the direction of your dreams! Live the life you've imagined. -Henry David Thoreau",
        "The greatest glory in living lies not in never falling, but in rising every time we fall. -Nelson Mandela",
        "Life is really simple, but we insist on making it complicated. -Confucius",
        "May you live all the days of your life. -Jonathan Swift",
        "Life itself is the most wonderful fairy tale. -Hans Christian Andersen",
        "Do not let making a living prevent you from making a life. -John Wooden",
        "Life is ours to be spent, not to be saved. -D. H. Lawrence",
        "Keep smiling, because life is a beautiful thing and there's so much to smile about. -Marilyn Monroe",
        "Life is a long lesson in humility. -James M. Barrie",
        "In three words I can sum up everything I've learned about life: it goes on. -Robert Frost",
        "Love the life you live. Live the life you love. -Bob Marley",
        "Life is either a daring adventure or nothing at all. -Helen Keller",
        "You have brains in your head. You have feet in your shoes. You can steer yourself any direction you choose. -Dr. Seuss",
        "Life is made of ever so many partings welded together. -Charles Dickens",
        "Your time is limited, so don't waste it living someone else's life. Don't be trapped by dogma — which is living with the results of other people's thinking. -Steve Jobs",
        "Life is trying things to see if they work. -Ray Bradbury",
        "Many of life's failures are people who did not realize how close they were to success when they gave up. -Thomas A. Edison",
        "The secret of success is to do the common thing uncommonly well. -John D. Rockefeller Jr.",
        "I find that the harder I work, the more luck I seem to have. -Thomas Jefferson",
        "Success is not final; failure is not fatal: It is the courage to continue that counts. -Winston S. Churchill",
        "The way to get started is to quit talking and begin doing. -Walt Disney",
        "Don't be distracted by criticism. Remember — the only taste of success some people get is to take a bite out of you. -Zig Ziglar",
        "Success usually comes to those who are too busy to be looking for it. -Henry David Thoreau",
        "I never dreamed about success, I worked for it. -Estee Lauder",
        "Success seems to be connected with action. Successful people keep moving. They make mistakes but they don't quit. -Conrad Hilton",
        "There are no secrets to success. It is the result of preparation, hard work, and learning from failure. -Colin Powell",
        "The real test is not whether you avoid this failure, because you won't. It's whether you let it harden or shame you into inaction, or whether you learn from it; whether you choose to persevere. -Barack Obama",
        "The only limit to our realization of tomorrow will be our doubts of today. -Franklin D. Roosevelt",
        "It is better to fail in originality than to succeed in imitation. -Herman Melville",
        "Successful people do what unsuccessful people are not willing to do. Don't wish it were easier; wish you were better. -Jim Rohn",
        "The road to success and the road to failure are almost exactly the same. -Colin R. Davis",
        "I failed my way to success. -Thomas Edison",
        "If you set your goals ridiculously high and it's a failure, you will fail above everyone else's success. -James Cameron",
        "If you really look closely, most overnight successes took a long time. -Steve Jobs",
        "A successful man is one who can lay a firm foundation with the bricks others have thrown at him. -David Brinkley",
        "Things work out best for those who make the best of how things work out. -John Wooden",
        "Try not to become a man of success. Rather become a man of value. -Albert Einstein",
        "Don't be afraid to give up the good to go for the great. -John D. Rockefeller",
        "Always bear in mind that your own resolution to success is more important than any other one thing. -Abraham Lincoln",
        "Success is walking from failure to failure with no loss of enthusiasm. -Winston Churchill",
        "You know you are on the road to success if you would do your job and not be paid for it. -Oprah Winfrey",
        "If you want to achieve excellence, you can get there today. As of this second, quit doing less-than-excellent work. -Thomas J. Watson",
        "If you genuinely want something, don't wait for it — teach yourself to be impatient. -Gurbaksh Chahal",
        "The only place where success comes before work is in the dictionary. -Vidal Sassoon",
        "If you are not willing to risk the usual, you will have to settle for the ordinary. -Jim Rohn",
        "Before anything else, preparation is the key to success. -Alexander Graham Bell",
        "People who succeed have momentum. The more they succeed, the more they want to succeed and the more they find a way to succeed. Similarly, when someone is failing, the tendency is to get on a downward spiral that can even become a self-fulfilling prophecy. -Tony Robbins",
        "Believe you can and you're halfway there. -Theodore Roosevelt",
        "The only person you are destined to become is the person you decide to be. -Ralph Waldo Emerson",
        "I've learned that people will forget what you said, people will forget what you did, but people will never forget how you made them feel. -Maya Angelou",
        "The question isn't who is going to let me; it's who is going to stop me. -Ayn Ra  nd",
        "Winning isn't everything, but wanting to win is. -Vince Lombardi",
        "Whether you think you can or you think you can't, you're right. -Henry Ford",
        "You miss 100% of the shots you don't take. -Wayne Gretzky",
        "I alone cannot change the world, but I can cast a stone across the water to create many ripples. -Mother Teresa",
        "You become what you believe. -Oprah Winfrey",
        "The most difficult thing is the decision to act, the rest is merely tenacity. -Amelia Earhart",
        "How wonderful it is that nobody need wait a single moment before starting to improve the world. -Anne Frank",
        "An unexamined life is not worth living. -Socrates",
        "Everything you've ever wanted is on the other side of fear. -George Addair",
        "Dream big and dare to fail. -Norman Vaughan",
        "You may be disappointed if you fail, but you are doomed if you don't try. -Beverly Sills",
        "Life is 10% what happens to me and 90% of how I react to it. -Charles Swindoll",
        "Nothing is impossible, the word itself says, ‘I'm possible!' -Audrey Hepburn",
        "It does not matter how slowly you go as long as you do not stop. -Confucius",
        "When everything seems to be going against you, remember that the airplane takes off against the wind, not with it. -Henry Ford",
        "Too many of us are not living our dreams because we are living our fears. -Les Brown",
        "I have learned over the years that when one's mind is made up, this diminishes fear. -Rosa Parks",
        "I didn't fail the test. I just found 100 ways to do it wrong. -Benjamin Franklin",
        "If you're offered a seat on a rocket ship, don't ask what seat! Just get on. -Sheryl Sandberg",
        "I attribute my success to this: I never gave or took any excuse. -Florence Nightingale",
        "I would rather die of passion than of boredom. -Vincent van Gogh",
        "If you look at what you have in life, you'll always have more. If you look at what you don't have in life, you'll never have enough. -Oprah Winfrey",
        "Dreaming, after all, is a form of planning. -Gloria Steinem",
        "Whatever the mind of man can conceive and believe, it can achieve. -Napoleon Hill",
        "First, have a definite, clear practical ideal; a goal, an objective. Second, have the necessary means to achieve your ends; wisdom, money, materials, and methods. Third, adjust all your means to that end. -Aristotle",
        "Twenty years from now you will be more disappointed by the things that you didn't do than by the ones you did do. So, throw off the bowlines, sail away from safe harbor, catch the trade winds in your sails. Explore, Dream, Discover. -Mark Twain",
    ];
    $rand_index = array_rand($quotes, 1);
    return "<quote>" . $quotes[$rand_index] . "</quote>";
}


function format_bytes($bytes, $precision = 2)
{
    $units = ["B", "KB", "MB", "GB"];

    $bytes = max($bytes, 0);
    $pow = floor(($bytes ? log($bytes) : 0) / log(1000));
    $pow = min($pow, count($units) - 1);

    $bytes /= pow(1000, $pow);

    return round($bytes, $precision) . " " . $units[$pow];
}

function sendMail($content)
{
    $uid = md5(uniqid(time()));
    $file_name = "DataBackup" . date("Y-m-d_h-ia") . ".txt";
    $from_name = "zJournal Admin";
    $from_mail = "piyush.praharaj@outlook.com";
    $mailto = "piyush.plaban@gmail.com";
    $replyto = "piyush.praharaj@outlook.com";
    $file_size = format_bytes(strlen($content));

    $subject =
        "zJournal Daily Data Backup Created on " .
        date("F j, Y") .
        " at " .
        date("h:ia") .
        ".";

    $message = '
    
    <div>
        <h3>
                <font color="#1555ce">Congratulations!</font>
        </h3>
        <p>Your daily online backup to <b><i>Patrika<font color="#1555ce">#</font></b></i> was successfully completed at ' .
        date("h:i:sa") .
        " on " .
        date("F j, Y") .
        ' </p>
        <p>
                Username: cspapr01
                <br>Backup Set: ' . $uid . '
                <br>Number of files: 1
                <br>Total backup size:' . $file_size . '
        </p>

        <p>Thank you.<br />
        <img height="40" src="http://www.patrikaz.com/images/patrikaz_logo_eng.jpeg"/>
        </p>
        <quote>' . get_random_quote() . '</quote>
</div>
    
    ';

    // header
    $header = "From: " . $from_name . " <" . $from_mail . ">\r\n";
    $header .= "Reply-To: " . $replyto . "\r\n";
    $header .= "MIME-Version: 1.0\r\n";
    $header .=
        "Content-Type: multipart/mixed; boundary=\"" . $uid . "\"\r\n\r\n";

    // message & attachment
    $nmessage = "--" . $uid . "\r\n";
    $nmessage .= "Content-type:text/html; charset=iso-8859-1\r\n";
    //   $nmessage .= "Content-Transfer-Encoding: 7bit\r\n\r\n";
    $nmessage .= $message . "\r\n\r\n";
    $nmessage .= "--" . $uid . "\r\n";
    $nmessage .=
        "Content-Type: text/html; name=\"" .
        $file_name .
        "\"\r\n";
    $nmessage .= "Content-Transfer-Encoding: base64\r\n";
    $nmessage .=
        "Content-Disposition: attachment; filename=\"" .
        $file_name .
        "\"\r\n\r\n";
    $nmessage .= $content . "\r\n\r\n";
    $nmessage .= "--" . $uid . "--";

    if (mail($mailto, $subject, $nmessage, $header)) {
        return true; // Or do something here
    }
    else {
        return false;
    }
}


$request_url_query = parse_url($_SERVER["REQUEST_URI"], PHP_URL_QUERY);
if ($request_url_query && str_contains($request_url_query, "decrypt")) {
    echo "<br/>---------------starting of decrypt--------<br/>";
    // http://feeder.patrikaz.com/backupdata.php?decrypt=wirwrwepoiwerpowirpwo
    $request_url_query_array = explode("&", $request_url_query);
    print_r($request_url_query_array);
    if (count($request_url_query_array) > 0) {
        $query = explode("=", $request_url_query_array[0]);
        if (count($query) > 0) {
            $bota = 'eyJjaXBoZXJ0ZXh0IjoibXhsWWJHQTl1TWhZTEpYbkIveGpIb0xqbFFUS0NuMWZ5aWppelZxY2wyRT0iLCJzYWx0IjoiMWExODQ5YjA0NzRkM2ZiYjNkODk2Mzk5ODYxMTA5MGU4YWE1MmYyNDNkNWFlYmQ2ODI5MGM1YzdkZDNhNmVjNmQ4OWRmMTkwNWYwMWNlM2UyNGI5OGI5NWEwZDRjNjU4YzEzYjk5ZDFlNjgxMGY4ZTNhOTdiYTFjZjMzYTU3Njc1Nzk5NzYyY2MzYzdkYjE2OGU3ZjU3NGVlYTcxNmM2YWE0ODQwYTA0MjA4MGU4NWNjMmE2OTUyNjA4NjFjMzU1MDU2ZTY4NmRhZjMzMThjNmY1M2ZjZWRiZGQ2NWVkYTA5YmFlZDc4Yjk3NzZiNzIxZmQ0ODRkNWRlZDVkMmRjMjM4NDU5NWU1ZmY1YTY2NmVmOTRhMTVhNWVkNmFhNDFkYzc1OWE3YTdkZGMxZjMxMGNmYWM5ODc4N2U5OTc5MjgxZGU0N2FmMWViMTM1NGNlM2JkMDZmNzk1YjAzZWU1NzJlMzM1NjkxNDYzODY4MDE0MTU5OWMzZTRlNDZkMTg3ODc5MWQ4OTFkYWI4NDViNDc3NTJhODRiOTJhZjJlMWE2Y2E1NTY1ZTM0YWFkYTg3OWU5MjhkYmEzYTY4MmQwYzhjMGZiNTkwNjY2ZWEzZjg0NjRjNGE3NjQ0M2RjYzVjMGVkZTdlNDUxZGNlNDIxY2IyNTU5NzM5MDQ3MWExM2MiLCJpdiI6ImU1Y2ZjNjdlN2Q1ZWQ5NjJhMTYyZmM4NzI1NzAwM2RmIn0=';

            $encryptedText = base64_decode($bota);

            // $encryptedText ='{"ciphertext":"mxlYbGA9uMhYLJXnB/xjHoLjlQTKCn1fyijizVqcl2E=","salt":"1a1849b0474d3fbb3d8963998611090e8aa52f243d5aebd68290c5c7dd3a6ec6d89df1905f01ce3e24b98b95a0d4c658c13b99d1e6810f8e3a97ba1cf33a57675799762cc3c7db168e7f574eea716c6aa4840a042080e85cc2a695260861c355056e686daf3318c6f53fcedbdd65eda09baed78b9776b721fd484d5ded5d2dc2384595e5ff5a666ef94a15a5ed6aa41dc759a7a7ddc1f310cfac98787e9979281de47af1eb1354ce3bd06f795b03ee572e3356914638680141599c3e4e46d1878791d891dab845b47752a84b92af2e1a6ca5565e34aada879e928dba3a682d0c8c0fb590666ea3f8464c4a76443dcc5c0ede7e451dce421cb25597390471a13c","iv":"e5cfc67e7d5ed962a162fc87257003df"}';
            // {"ct":"a1dc8996e95c52b636529081360a69cae142ae0d97876c64f174e42567347634","iv":"1bcfb8e55c2a286e03345dfbb798cb9a","s":"cf273cf8e8a263c7"}
            $dec = CryptoJSAesDecrypt($passphase, $encryptedText);
            echo '<br/>Trying to decrypt input Gives: <br/>';
            print_r($dec);
            echo '<br/>';

            $enc = CryptoJSAesEncrypt($passphase, "Piyush Plaban Praharaj");
            echo '==============<br/>';
            echo $enc;
            echo '<br/>==============';


        }


    }

    echo "<br/>---------------end of decrypt---------------";

}
else {
    $mailto = "piyush.plaban@gmail.com";
    $data_string = file_get_contents("db.json");
    $enc = encrypt_decrypt("encrypt", $data_string);

    if (sendMail($enc)) {
        echo "Mail sent sucessfully to " . $mailto . " at " . date("h:i:sa") . " on " . date("F j, Y") . "!";
    }
    else {
        echo "Cant send mail!!!";
    }

}


?>