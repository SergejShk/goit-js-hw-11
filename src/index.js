import ImageApiService from './search-service';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import { Loading } from 'notiflix/build/notiflix-loading-aio';
import articlesTpl from './templates/articles.hbs';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const imageApiService = new ImageApiService();
let gallery = new SimpleLightbox('.gallery a');

const refs = {
  searchForm: document.querySelector('.search-form'),
  galleryContainer: document.querySelector('.gallery'),
  loadMoreBtn: document.querySelector('.load-more'),
};

refs.searchForm.addEventListener('submit', onFormSubmit);
refs.loadMoreBtn.addEventListener('click', onLoadMoreImage);

async function onFormSubmit(e) {
  e.preventDefault();
  imageApiService.query = e.currentTarget.elements.searchQuery.value.trim();

  refs.loadMoreBtn.classList.add('is-hidden');
  clearArticlesContainer();
  imageApiService.resetPage();
  imageApiService.resetTotalHitsApi();

  if (imageApiService.searchQuery === '') {
    Notify.failure('Sorry, enter a query in the search field.', {
      width: '500px',
      fontSize: '28px',
    });
    return;
  }

  await handleQueryApi();
  notificationToltalHits();
}

async function onLoadMoreImage() {
  await handleQueryApi();
  scrollPage();
}

async function handleQueryApi() {
  try {
    Loading.circle('Loading...');
    const data = await imageApiService.getArticles();

    appendArticlesMarkup(data);
    Loading.remove();
    refs.loadMoreBtn.classList.remove('is-hidden');

    gallery.refresh();
    checkDataLength(data);
    cheсkRestHits();
  } catch (error) {
    Loading.remove();
    refs.loadMoreBtn.classList.add('is-hidden');
    console.log(error);
  }
}

function appendArticlesMarkup(articles) {
  refs.galleryContainer.insertAdjacentHTML('beforeend', articlesTpl(articles));
}

function clearArticlesContainer() {
  refs.galleryContainer.innerHTML = '';
}

function scrollPage() {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2.3,
    behavior: 'smooth',
  });
}

function notificationToltalHits() {
  const totalHits = imageApiService.totalHitsApi;
  if (totalHits > 0) {
    Notify.success(`Hooray! We found ${totalHits} images.`, {
      width: '500px',
      fontSize: '28px',
    });
  }
}

function checkDataLength(data) {
  if (data.length === 0) {
    refs.loadMoreBtn.classList.add('is-hidden');
    Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.',
      {
        width: '500px',
        fontSize: '28px',
      }
    );
    Loading.remove();
  }
}

function cheсkRestHits() {
  if (imageApiService.totalHitsApi === 0) return;
  if (imageApiService.totalHitsApi <= imageApiService.receivedHitsApi) {
    Notify.warning(
      "We're sorry, but you've reached the end of search results.",
      {
        width: '500px',
        fontSize: '28px',
      }
    );
    refs.loadMoreBtn.classList.add('is-hidden');
  }
}
