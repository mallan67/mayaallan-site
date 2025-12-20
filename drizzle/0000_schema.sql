-- 0000_schema.sql - Initial schema migration generated from local restored DB (pgtest)
-- This file contains CREATE statements for schemas, types, tables, sequences, and constraints.
-- Inspect this file carefully before committing.
--
-- PostgreSQL database dump
--


-- Dumped from database version 17.7 (Debian 17.7-3.pgdg13+1)
-- Dumped by pg_dump version 17.7 (Debian 17.7-3.pgdg13+1)


--
-- Name: drizzle; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA drizzle;--> statement-breakpoint


--
-- Name: ArticleStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."ArticleStatus" AS ENUM (
    'DRAFT',
    'PUBLISHED'
);--> statement-breakpoint


--
-- Name: BookStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."BookStatus" AS ENUM (
    'DRAFT',
    'COMING_SOON',
    'PUBLISHED'
);--> statement-breakpoint


--
-- Name: EventStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."EventStatus" AS ENUM (
    'DRAFT',
    'UPCOMING',
    'PAST'
);--> statement-breakpoint


--
-- Name: EventType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."EventType" AS ENUM (
    'ONLINE',
    'IN_PERSON'
);--> statement-breakpoint


--
-- Name: MediaStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."MediaStatus" AS ENUM (
    'DRAFT',
    'PUBLISHED'
);--> statement-breakpoint


--
-- Name: MediaType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."MediaType" AS ENUM (
    'MUSIC',
    'GUIDED_AUDIO',
    'VIDEO',
    'PDF_GUIDE',
    'OTHER'
);--> statement-breakpoint


--
-- Name: media_type; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.media_type AS ENUM (
    'audio',
    'video',
    'external'
);--> statement-breakpoint




--
-- Name: __drizzle_migrations; Type: TABLE; Schema: drizzle; Owner: -
--

CREATE TABLE drizzle.__drizzle_migrations (
    id integer NOT NULL,
    hash text NOT NULL,
    created_at bigint
);--> statement-breakpoint


--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE; Schema: drizzle; Owner: -
--

CREATE SEQUENCE drizzle.__drizzle_migrations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;--> statement-breakpoint


--
-- Name: __drizzle_migrations_id_seq; Type: SEQUENCE OWNED BY; Schema: drizzle; Owner: -
--

ALTER SEQUENCE drizzle.__drizzle_migrations_id_seq OWNED BY drizzle.__drizzle_migrations.id;--> statement-breakpoint


--
-- Name: admin_user; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.admin_user (
    id integer NOT NULL,
    email text NOT NULL,
    password_hash text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    display_name character varying(200),
    is_active boolean DEFAULT true NOT NULL
);--> statement-breakpoint


--
-- Name: admin_user_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.admin_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;--> statement-breakpoint


--
-- Name: admin_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.admin_user_id_seq OWNED BY public.admin_user.id;--> statement-breakpoint


--
-- Name: book; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.book (
    id integer NOT NULL,
    slug text NOT NULL,
    title text NOT NULL,
    subtitle_1 text,
    subtitle_2 text,
    isbn text,
    short_description text,
    long_description text,
    cover_image_url text,
    back_cover_image_url text,
    is_published boolean DEFAULT false NOT NULL,
    coming_soon boolean DEFAULT false NOT NULL,
    direct_sale_enabled boolean DEFAULT false NOT NULL,
    stripe_product_id text,
    paypal_button_id text,
    seo_title text,
    seo_description text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    tags jsonb DEFAULT '[]'::jsonb NOT NULL,
    sales_metadata jsonb DEFAULT '{}'::jsonb NOT NULL,
    seo jsonb DEFAULT '{}'::jsonb NOT NULL
);--> statement-breakpoint


--
-- Name: book_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.book_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;--> statement-breakpoint


--
-- Name: book_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.book_id_seq OWNED BY public.book.id;--> statement-breakpoint


--
-- Name: book_retailer_link; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.book_retailer_link (
    book_id integer NOT NULL,
    retailer_id integer NOT NULL,
    url text NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    types jsonb DEFAULT '[]'::jsonb NOT NULL
);--> statement-breakpoint


--
-- Name: contact_submission; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.contact_submission (
    id integer NOT NULL,
    name text,
    email character varying(255),
    message text,
    source text,
    meta jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint


--
-- Name: contact_submission_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.contact_submission_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;--> statement-breakpoint


--
-- Name: contact_submission_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.contact_submission_id_seq OWNED BY public.contact_submission.id;--> statement-breakpoint


--
-- Name: email_subscriber; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.email_subscriber (
    id integer NOT NULL,
    email character varying(255) NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint


--
-- Name: email_subscriber_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.email_subscriber_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;--> statement-breakpoint


--
-- Name: email_subscriber_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.email_subscriber_id_seq OWNED BY public.email_subscriber.id;--> statement-breakpoint


--
-- Name: event; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.event (
    id integer NOT NULL,
    title text NOT NULL,
    description text,
    start_at timestamp with time zone,
    end_at timestamp with time zone,
    location text,
    url text,
    is_published boolean DEFAULT false NOT NULL,
    is_visible boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint


--
-- Name: event_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.event_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;--> statement-breakpoint


--
-- Name: event_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.event_id_seq OWNED BY public.event.id;--> statement-breakpoint


--
-- Name: media_item; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.media_item (
    id integer NOT NULL,
    type public.media_type NOT NULL,
    title text NOT NULL,
    description text,
    cover_image_url text,
    file_url text,
    external_url text,
    isbn text,
    is_published boolean DEFAULT false NOT NULL,
    is_visible boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint


--
-- Name: media_item_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.media_item_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;--> statement-breakpoint


--
-- Name: media_item_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.media_item_id_seq OWNED BY public.media_item.id;--> statement-breakpoint


--
-- Name: retailer; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.retailer (
    id integer NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    icon_url text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);--> statement-breakpoint


--
-- Name: retailer_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.retailer_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;--> statement-breakpoint


--
-- Name: retailer_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.retailer_id_seq OWNED BY public.retailer.id;--> statement-breakpoint


--
-- Name: site_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.site_settings (
    id integer NOT NULL,
    seo_title text,
    seo_description text,
    og_image_url text,
    accent_color text,
    font_family text,
    layout_width text,
    button_style text,
    is_visible boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint


--
-- Name: site_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.site_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;--> statement-breakpoint


--
-- Name: site_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.site_settings_id_seq OWNED BY public.site_settings.id;--> statement-breakpoint


--
-- Name: __drizzle_migrations id; Type: DEFAULT; Schema: drizzle; Owner: -
--

ALTER TABLE ONLY drizzle.__drizzle_migrations ALTER COLUMN id SET DEFAULT nextval('drizzle.__drizzle_migrations_id_seq'::regclass);--> statement-breakpoint


--
-- Name: admin_user id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_user ALTER COLUMN id SET DEFAULT nextval('public.admin_user_id_seq'::regclass);--> statement-breakpoint


--
-- Name: book id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.book ALTER COLUMN id SET DEFAULT nextval('public.book_id_seq'::regclass);--> statement-breakpoint


--
-- Name: contact_submission id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contact_submission ALTER COLUMN id SET DEFAULT nextval('public.contact_submission_id_seq'::regclass);--> statement-breakpoint


--
-- Name: email_subscriber id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_subscriber ALTER COLUMN id SET DEFAULT nextval('public.email_subscriber_id_seq'::regclass);--> statement-breakpoint


--
-- Name: event id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event ALTER COLUMN id SET DEFAULT nextval('public.event_id_seq'::regclass);--> statement-breakpoint


--
-- Name: media_item id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.media_item ALTER COLUMN id SET DEFAULT nextval('public.media_item_id_seq'::regclass);--> statement-breakpoint


--
-- Name: retailer id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.retailer ALTER COLUMN id SET DEFAULT nextval('public.retailer_id_seq'::regclass);--> statement-breakpoint


--
-- Name: site_settings id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_settings ALTER COLUMN id SET DEFAULT nextval('public.site_settings_id_seq'::regclass);--> statement-breakpoint


--
-- Name: __drizzle_migrations __drizzle_migrations_pkey; Type: CONSTRAINT; Schema: drizzle; Owner: -
--

ALTER TABLE ONLY drizzle.__drizzle_migrations
    ADD CONSTRAINT __drizzle_migrations_pkey PRIMARY KEY (id);--> statement-breakpoint


--
-- Name: admin_user admin_user_email_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_user
    ADD CONSTRAINT admin_user_email_unique UNIQUE (email);--> statement-breakpoint


--
-- Name: admin_user admin_user_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.admin_user
    ADD CONSTRAINT admin_user_pkey PRIMARY KEY (id);--> statement-breakpoint


--
-- Name: book book_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.book
    ADD CONSTRAINT book_pkey PRIMARY KEY (id);--> statement-breakpoint


--
-- Name: book_retailer_link book_retailer_link_book_id_retailer_id_pk; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.book_retailer_link
    ADD CONSTRAINT book_retailer_link_book_id_retailer_id_pk PRIMARY KEY (book_id, retailer_id);--> statement-breakpoint


--
-- Name: book book_slug_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.book
    ADD CONSTRAINT book_slug_unique UNIQUE (slug);--> statement-breakpoint


--
-- Name: contact_submission contact_submission_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.contact_submission
    ADD CONSTRAINT contact_submission_pkey PRIMARY KEY (id);--> statement-breakpoint


--
-- Name: email_subscriber email_subscriber_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.email_subscriber
    ADD CONSTRAINT email_subscriber_pkey PRIMARY KEY (id);--> statement-breakpoint


--
-- Name: event event_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.event
    ADD CONSTRAINT event_pkey PRIMARY KEY (id);--> statement-breakpoint


--
-- Name: media_item media_item_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.media_item
    ADD CONSTRAINT media_item_pkey PRIMARY KEY (id);--> statement-breakpoint


--
-- Name: retailer retailer_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.retailer
    ADD CONSTRAINT retailer_pkey PRIMARY KEY (id);--> statement-breakpoint


--
-- Name: retailer retailer_slug_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.retailer
    ADD CONSTRAINT retailer_slug_unique UNIQUE (slug);--> statement-breakpoint


--
-- Name: site_settings site_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.site_settings
    ADD CONSTRAINT site_settings_pkey PRIMARY KEY (id);--> statement-breakpoint


--
-- Name: admin_email_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX admin_email_idx ON public.admin_user USING btree (email);--> statement-breakpoint


--
-- Name: book_published_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX book_published_idx ON public.book USING btree (is_published);--> statement-breakpoint


--
-- Name: book_slug_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX book_slug_idx ON public.book USING btree (slug);--> statement-breakpoint


--
-- Name: email_subscriber_email_unique; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX email_subscriber_email_unique ON public.email_subscriber USING btree (email);--> statement-breakpoint


--
-- Name: idx_book_is_published; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_book_is_published ON public.book USING btree (is_published);--> statement-breakpoint


--
-- Name: idx_event_start_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_event_start_at ON public.event USING btree (start_at);--> statement-breakpoint


--
-- Name: retailer_slug_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX retailer_slug_idx ON public.retailer USING btree (slug);--> statement-breakpoint


--
-- Name: book_retailer_link book_retailer_link_book_id_book_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.book_retailer_link
    ADD CONSTRAINT book_retailer_link_book_id_book_id_fk FOREIGN KEY (book_id) REFERENCES public.book(id) ON DELETE CASCADE;--> statement-breakpoint


--
-- Name: book_retailer_link book_retailer_link_retailer_id_retailer_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.book_retailer_link
    ADD CONSTRAINT book_retailer_link_retailer_id_retailer_id_fk FOREIGN KEY (retailer_id) REFERENCES public.retailer(id) ON DELETE CASCADE;--> statement-breakpoint


--
-- PostgreSQL database dump complete
--


